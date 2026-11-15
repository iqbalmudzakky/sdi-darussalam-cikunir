#!/usr/bin/env bash
#
# Dipasang di VPS sebagai /usr/local/bin/pmb-update-geoip (root:root, mode 755)
# dan dijalankan cron tiap bulan, mis. di /etc/cron.d/pmb:
#
#   0 3 4 * * root /usr/local/bin/pmb-update-geoip >>/var/log/pmb-geoip.log 2>&1
#
# Mengunduh DB-IP City Lite terbaru (rilis bulanan, CC BY 4.0) untuk perkiraan
# asal daerah di halaman Pengunjung dashboard admin. Berkasnya dipakai dua env
# sekaligus: compose.yml memasang /var/lib/pmb/geoip ke dalam container secara
# read-only, dan aplikasi membacanya dari GEOIP_DATABASE.
#
# Berkas lama baru diganti setelah berkas baru selesai diekstrak, dan
# penggantiannya lewat mv di folder yang sama, jadi aplikasi tidak pernah
# melihat berkas setengah jadi. Aplikasi mengecek ulang berkas tiap 10 menit,
# sehingga tidak perlu restart.

set -euo pipefail
umask 022

readonly DIR=/var/lib/pmb/geoip
readonly TARGET="$DIR/dbip-city-lite.mmdb"

# Berkas City Lite sekitar 120 MB. Di bawah angka ini berarti unduhan rusak.
readonly MIN_BYTES=50000000

log() { printf '[pmb-update-geoip] %s\n' "$*"; }
fail() {
	printf '[pmb-update-geoip] GAGAL: %s\n' "$*" >&2
	exit 1
}

mkdir -p "$DIR"

compressed="$TARGET.unduh.gz"
extracted="$TARGET.unduh"
trap 'rm -f "$compressed" "$extracted"' EXIT

# DB-IP menerbitkan berkas di awal bulan. Bila berkas bulan ini belum ada,
# dipakai bulan lalu.
month=""
for candidate in "$(date +%Y-%m)" "$(date -d 'last month' +%Y-%m)"; do
	if curl -fsSL -m 600 -o "$compressed" \
		"https://download.db-ip.com/free/dbip-city-lite-$candidate.mmdb.gz"; then
		month="$candidate"
		break
	fi
done
[ -n "$month" ] || fail "berkas bulan ini dan bulan lalu belum bisa diunduh"

gunzip -c "$compressed" >"$extracted"

size=$(stat -c %s "$extracted")
[ "$size" -ge "$MIN_BYTES" ] || fail "berkas hasil unduhan terlalu kecil ($size bita)"

chmod 644 "$extracted"
mv "$extracted" "$TARGET"

log "basis data lokasi DB-IP $month terpasang ($size bita)"
