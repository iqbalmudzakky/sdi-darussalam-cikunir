#!/usr/bin/env bash
#
# Dipasang di VPS sebagai /usr/local/bin/pmb-deploy (root:root, mode 755).
#
# Kunci deploy GitHub Actions dikunci ke skrip ini lewat forced command, jadi
# apa pun yang dikirim lewat SSH tetap berujung di sini. Perintah aslinya
# terbaca lewat $SSH_ORIGINAL_COMMAND dan hanya empat bentuk yang diterima:
#
#   deploy <production|staging> [tag]   tarik image lalu buat ulang container
#   rollback <production|staging> <tag> sama dengan deploy, tag wajib diisi
#   status                              apa yang sedang berjalan
#   put-compose                         ganti compose.yml dari stdin
#
# TIDAK ADA nilai rahasia di berkas ini. Sandi database dan bearer cron dibaca
# aplikasi dari /etc/pmb/<env>.env yang dibuat di server.

set -euo pipefail
umask 077

readonly DIR=/opt/pmb
readonly COMPOSE="$DIR/compose.yml"

log() { printf '[pmb-deploy] %s\n' "$*"; }
fail() {
	printf '[pmb-deploy] GAGAL: %s\n' "$*" >&2
	exit 1
}

# Skrip ini adalah batas keamanan, jadi argumennya diperiksa ketat — bukan
# dipercaya karena "kan cuma dikirim workflow kita sendiri".
valid_env() {
	case "$1" in
	production | staging) ;;
	*) fail "lingkungan tidak dikenal: $1" ;;
	esac
}

valid_tag() {
	[[ "$1" =~ ^[A-Za-z0-9._-]{1,128}$ ]] || fail "tag tidak sah: $1"
}

port_for() {
	[ "$1" = "production" ] && echo 3000 || echo 3001
}

deploy() {
	local service="$1" tag="${2:-}"
	valid_env "$service"

	if [ -z "$tag" ]; then
		[ "$service" = "production" ] && tag=main || tag=staging
	fi
	valid_tag "$tag"

	cd "$DIR"
	if [ "$service" = "production" ]; then
		export PMB_TAG_PRODUCTION="$tag"
	else
		export PMB_TAG_STAGING="$tag"
	fi

	log "menarik image $service:$tag"
	docker compose pull "$service" </dev/null

	# --force-recreate wajib: tanpa itu, Compose pernah melaporkan sukses
	# padahal container lama tidak pernah diganti (INFRASTRUKTUR-VPS 6.7f).
	log "membuat ulang container $service"
	docker compose up -d --force-recreate "$service" </dev/null

	local container="pmb-$service"
	local status=starting
	for _ in $(seq 1 30); do
		status=$(docker inspect --format '{{.State.Health.Status}}' "$container" 2>/dev/null || echo starting)
		[ "$status" = "healthy" ] && break
		sleep 5
	done
	if [ "$status" != "healthy" ]; then
		docker compose logs --tail 50 "$service" </dev/null || true
		fail "container tidak pernah sehat (status terakhir: $status)"
	fi

	# Buktikan yang berjalan memang image baru. 'docker compose images -q'
	# tidak memakai awalan sha256:, 'docker inspect' selalu memakainya —
	# tanpa disamakan, perbandingan ini selalu gagal walau keduanya benar.
	local expected actual
	expected=$(docker compose images -q "$service" </dev/null | sed 's/^sha256://')
	actual=$(docker inspect --format '{{.Image}}' "$container" | sed 's/^sha256://')
	[ -n "$expected" ] || fail "tidak bisa membaca image yang seharusnya berjalan"
	if [ "$expected" != "$actual" ]; then
		fail "container berjalan dengan image lain: $actual (seharusnya $expected)"
	fi

	# Diuji lewat halaman yang benar-benar dibuka orang, bukan endpoint health.
	# Absensi pernah 503 untuk semua orang tua sementara health-nya tetap 200,
	# karena alamat itu dikecualikan dari mode pemeliharaan (6.7h).
	local port body
	port=$(port_for "$service")
	body=$(curl -fsS -m 20 "http://127.0.0.1:$port/" || true)
	if ! printf '%s' "$body" | grep -qi "darussalam"; then
		fail "landing page tidak menjawab sebagaimana mestinya di port $port"
	fi

	docker image prune -f >/dev/null </dev/null || true
	log "selesai: $service kini berjalan pada tag $tag"
}

status() {
	docker compose -f "$COMPOSE" ps </dev/null
}

# compose.yml dikirim lewat stdin karena forced command menutup scp. Yang baru
# hanya dipasang setelah terbukti sah — compose.yml rusak berarti kedua env
# tidak bisa di-deploy sampai ada yang masuk ke server secara manual.
put_compose() {
	local incoming="$DIR/compose.yml.baru"
	cat >"$incoming"
	[ -s "$incoming" ] || {
		rm -f "$incoming"
		fail "compose.yml yang dikirim kosong"
	}

	if ! docker compose -f "$incoming" config -q </dev/null; then
		rm -f "$incoming"
		fail "compose.yml yang dikirim tidak sah, yang lama dipertahankan"
	fi

	[ -f "$COMPOSE" ] && cp -a "$COMPOSE" "$COMPOSE.sebelum-$(date +%F-%H%M%S)"
	mv "$incoming" "$COMPOSE"
	log "compose.yml diperbarui"
}

main() {
	local cmd="${SSH_ORIGINAL_COMMAND:-}"
	[ -n "$cmd" ] || fail "tidak ada perintah; yang diterima: deploy, rollback, status, put-compose"

	# Dipecah jadi kata, dan kata berlebih ditolak — bukan diabaikan diam-diam.
	read -r action arg1 arg2 extra <<<"$cmd"
	[ -z "${extra:-}" ] || fail "argumen berlebih"

	case "$action" in
	deploy) deploy "${arg1:-}" "${arg2:-}" ;;
	rollback)
		[ -n "${arg2:-}" ] || fail "rollback wajib menyebut tag"
		deploy "${arg1:-}" "$arg2"
		;;
	status) status ;;
	put-compose) put_compose ;;
	*) fail "perintah tidak dikenal: $action" ;;
	esac
}

main "$@"
