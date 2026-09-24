# Cutover PMB Production — Vercel + Supabase → VPS

Daftar langkah untuk memindahkan situs publik `www.sdidarussalamcikunir.sch.id`
dari Vercel + Supabase ke VPS sekolah. Staging sudah melewati jalur yang sama
pada 22–24 September 2026; berkas ini mengulangnya untuk production, dengan titik
mundur di setiap tahap.

**Cara memakai:** kerjakan berurutan, satu langkah, periksa "yang dicari", baru
lanjut. Jangan melompat. Kalau "yang dicari" tidak muncul, berhenti di situ.

---

## Gambaran singkat

| Bagian | Kapan | Dampak ke pengunjung |
|---|---|---|
| A. Persiapan | Kapan saja sebelum hari-H | Tidak ada |
| B. Membekukan situs lama | Hari-H, awal | Pendaftaran baru ditutup sementara |
| C. Memindahkan data | Hari-H | Tidak ada — situs lama tetap tampil |
| D. Menyalakan production di VPS | Hari-H | Tidak ada — belum ada yang mengarah ke sana |
| E. Memindahkan DNS | Hari-H | **Beberapa menit tidak bisa diakses** |
| F. Verifikasi & membuka lagi | Hari-H, akhir | Kembali normal |
| G. Bersih-bersih | Beberapa hari setelahnya | Tidak ada |

Waktu yang disarankan: malam hari, di luar jam pendaftaran. Perkiraan total 1–2
jam termasuk pengecekan.

---

## Hal yang tidak boleh terjadi

1. **Merge `staging` → `main` selama Vercel masih terhubung ke GitHub.** Vercel
   akan otomatis membangun kode baru dan menayangkannya ke `www` — padahal kode
   itu sudah tidak bisa jalan di Vercel (Supabase dilepas, tidak ada
   `UPLOAD_DIR`). Situs mati sebelum DNS sempat dipindah. Karena itu Vercel
   diputus dulu di langkah B2.
2. **Memakai data atau foto staging untuk production.** Sumbernya Supabase
   **production**. Isinya berbeda.
3. **Mengaktifkan blok Caddy production sebelum DNS pindah.** Caddy akan gagal
   menerbitkan sertifikat berulang kali, dan Let's Encrypt membatasi kegagalan
   per hostname — bisa menahan penerbitan tepat saat dibutuhkan. Urutannya: DNS
   dulu, baru blok (permintaan tim infra).
4. **Menempel nilai rahasia ke chat** — sandi database, kunci DOKU production,
   kunci Resend.

---

## A. Persiapan — tidak mengubah apa pun yang dilihat publik

### A1. Uji staging sampai tuntas

- [ ] Login admin staging
- [ ] Unggah/ganti foto → tampil di landing page staging, dan di server berkasnya
      bermode `-rw-r--r-- 1001 1001`:
      `ls -l /var/lib/pmb/staging/uploads/<bucket>/`
- [ ] Pendaftaran + pembayaran DOKU sandbox lewat `staging.sdidarussalamcikunir.sch.id`
      sampai pendaftar muncul di admin **dan** email struk masuk

Kalau salah satunya gagal, perbaiki di staging dulu. Production tidak dimulai
sebelum ketiganya hijau.

### A2. Catat keadaan DNS sekarang — untuk mundur

Di Cloudflare → DNS → Records, salin nilai **lengkap** (bukan yang terpotong di
tabel — klik Edit untuk melihatnya) dari:

| Record | Tipe | Isi sekarang | Proxy |
|---|---|---|---|
| `sdidarussalamcikunir.sch.id` (root) | A | `216.198.79.1` | Proxied |
| `www` | CNAME | `665caf835e69193b.verc…` ← **salin utuh** | Proxied |

Simpan di catatan pribadi. Inilah yang dipasang ulang kalau harus mundur.

### A3. Kumpulkan nilai production dari Vercel

Vercel → Project → Settings → Environment Variables → environment **Production**.
Yang dibutuhkan (lihat nilainya di sana, jangan disalin ke chat):

- [ ] `DOKU_CLIENT_ID` dan `DOKU_SECRET_KEY` **production** (bukan sandbox)
- [ ] `RESEND_API_KEY`
- [ ] `ANALYTICS_SALT` — **wajib nilai yang sama** dengan yang sekarang. Kalau
      diganti, semua pengunjung lama terhitung sebagai orang baru.
- [ ] Session pooler URL Supabase **production** (Supabase → Connect → Session
      pooler, port `5432`) — sumber data di bagian C

### A4. Buat `/etc/pmb/production.env` di server

Sama seperti staging (pola yang sudah terbukti), dengan perbedaan:

```bash
install -d -m 750 -o root -g pmb /etc/pmb
db=$(cat /etc/darussalam-infra/postgres/pmb_production)
umask 027
cat > /etc/pmb/production.env <<EOF
SITE_URL=https://www.sdidarussalamcikunir.sch.id
DATABASE_URL=postgres://pmb_production:${db}@postgres:5432/pmb_production
UPLOAD_DIR=/var/lib/pmb/uploads
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_PEPPER=$(openssl rand -base64 32)
CRON_SECRET=$(openssl rand -hex 32)
EMAIL_FROM=no-reply@sdidarussalamcikunir.sch.id
DOKU_ENV=production
EOF
unset db
chown root:pmb /etc/pmb/production.env
chmod 640 /etc/pmb/production.env
```

Lalu tambahkan empat nilai dari A3, **satu baris perintah per nilai** (jangan
ditempel bersamaan — `read` akan menelan baris berikutnya):

```bash
read -rs -p "Resend API key: " R && printf 'RESEND_API_KEY=%s\n' "$R" >> /etc/pmb/production.env && unset R && echo OK
read -rs -p "Analytics salt (dari Vercel): " S && printf 'ANALYTICS_SALT=%s\n' "$S" >> /etc/pmb/production.env && unset S && echo OK
read -rs -p "DOKU client id PRODUCTION: " C && printf 'DOKU_CLIENT_ID=%s\n' "$C" >> /etc/pmb/production.env && unset C && echo OK
read -rs -p "DOKU secret key PRODUCTION: " D && printf 'DOKU_SECRET_KEY=%s\n' "$D" >> /etc/pmb/production.env && unset D && echo OK
```

Periksa: `cut -d= -f1 /etc/pmb/production.env | sort` → 12 nama, sama dengan
staging. Cocokkan nilai rahasia lewat `sha256sum` bila ragu (cara yang sama
seperti saat menyiapkan staging).

Catatan: JWT dibuat baru, jadi semua admin perlu login ulang setelah pindah.
Itu wajar.

### A5. Kembalikan `production.env` menjadi wajib di `compose.yml`

Setelah A4 selesai, ubah blok `production` di `compose.yml`:

```yaml
    env_file: /etc/pmb/production.env
```

(buang bentuk `required: false` beserta komentar ⚠️-nya), commit, push ke
`staging`. Tanpa ini, container production bisa naik tanpa konfigurasi dan
gagal dengan cara yang membingungkan.

### A6. Siapkan env laptop khusus production

Buat `web/.env.production.local` (sudah diabaikan git lewat `.env*`):

```
DATABASE_URL=postgres://pmb_production:<sandi>@127.0.0.1:5432/pmb_production
UPLOAD_DIR=C:/Dzakky/works/PID/uploads-pmb-production
```

Folder `uploads-pmb-production` **terpisah** dari `uploads-pmb` milik staging.

Sandi `pmb_production` dibaca di server dengan
`cat /etc/darussalam-infra/postgres/pmb_production` — salin langsung ke berkas,
jangan lewat chat.

### A7. Kabari tim infra tanggal & jam cutover

Mereka perlu siaga untuk: mengaktifkan blok Caddy production (langkah E3), dan
memasang cron `cleanup-tokens` beserta berkas `curl -K`-nya dari `CRON_SECRET`
di `/etc/pmb/production.env`.

---

## B. Hari-H — membekukan situs lama

### B1. Tutup pendaftaran di situs lama

Admin `www` (masih Vercel) → **Pembayaran** → set tanggal tutup pendaftaran ke
**kemarin**, simpan.

Yang dicari: tombol daftar di landing page `www` menunjukkan pendaftaran
ditutup.

Kenapa: data disalin di bagian C. Pendaftar yang masuk di sela penyalinan dan
perpindahan DNS akan tercatat di Supabase dan **tidak ikut pindah**.

Catat tanggal buka/tutup yang asli — dikembalikan di F3.

### B2. Putus Vercel dari GitHub

Vercel → Project → Settings → Git → **Disconnect**.

Yang dicari: halaman itu tidak lagi menunjukkan repository yang terhubung.

Situs `www` **tetap tampil** — Vercel terus menyajikan deployment terakhirnya.
Yang berhenti hanya pembangunan otomatis saat ada push ke `main`. Ini yang
membuat langkah D1 aman.

---

## C. Memindahkan data

Tunnel SSH ke VPS harus menyala selama bagian ini:

```bash
ssh -N -L 5432:127.0.0.1:5432 -i /c/Dzakky/works/PID/vps/id_ed25519_vps tunnel@187.77.146.164
```

(atau `root@...` bila kunci `tunnel` belum terpasang untukmu)

### C1. Pasang skema di `pmb_production`

```bash
cd /c/Dzakky/works/PID/sdi-darussalam-cikunir/web
node --env-file=.env.production.local scripts/migrate.mjs --dry-run
node --env-file=.env.production.local scripts/migrate.mjs
```

Yang dicari: `[migrate] applied 00000000_baseline.sql`.

### C2. Salin data dari Supabase production

```bash
SOURCE_DATABASE_URL="<session pooler Supabase PRODUCTION>" \
  node --env-file=.env.production.local scripts/copy-db.mjs --dry-run

SOURCE_DATABASE_URL="<session pooler Supabase PRODUCTION>" \
  node --env-file=.env.production.local scripts/copy-db.mjs --truncate
```

Yang dicari: `verified: row counts match for every table.`

⚠️ Periksa di keluaran `--dry-run` bahwa jumlah `ppdb_registrations` sama
dengan yang terlihat di admin `www` — itu tanda sumbernya memang production,
bukan staging.

### C3. Salin foto

```bash
node --env-file=.env.production.local scripts/copy-storage.mjs --dry-run
node --env-file=.env.production.local scripts/copy-storage.mjs
```

Yang dicari: `verified: every stored path exists on disk.`

### C4. Kirim foto ke server

Dari laptop:

```bash
scp -i /c/Dzakky/works/PID/vps/id_ed25519_vps -r /c/Dzakky/works/PID/uploads-pmb-production root@187.77.146.164:/tmp/
```

Di server — **tunggu prompt `root@...#` muncul dulu**, lalu tempel satu baris
ini (dirangkai `&&`, jadi `rm` hanya jalan bila penyalinan berhasil):

```bash
cp -a /tmp/uploads-pmb-production/. /var/lib/pmb/production/uploads/ && chown -R 1001:1001 /var/lib/pmb/production/uploads && find /var/lib/pmb/production/uploads -type d -exec chmod 755 {} + && find /var/lib/pmb/production/uploads -type f -exec chmod 644 {} + && rm -rf /tmp/uploads-pmb-production && ls -l /var/lib/pmb/production/uploads/activity-photos | head -5
```

Yang dicari: berkas bertanda `-rw-r--r-- 1 1001 1001`.

---

## D. Menyalakan production di VPS

### D1. Merge `staging` → `main`

Aman karena Vercel sudah diputus di B2.

Yang dicari: workflow **Bangun image** jalan otomatis untuk `main` dan hijau.

### D2. Deploy production

Actions → **Deploy ke VPS** → Run workflow:

- Use workflow from: `main`
- Lingkungan: `production`
- Tag: kosong
- Kirim ulang compose.yml: **centang** (versi A5 yang sudah mewajibkan
  `production.env`)

Yang dicari: hijau.

### D3. Periksa dari server

```bash
curl -s -o /dev/null -w 'status: %{http_code}\n' http://127.0.0.1:3000/ && docker ps --filter name=pmb --format '{{.Names}}\t{{.Status}}'
```

Yang dicari: `status: 200`, dan `pmb-production` serta `pmb-staging` sama-sama
`(healthy)`.

---

## E. Memindahkan DNS — di sini situs sempat tidak bisa diakses

Kerjakan E1–E3 berurutan tanpa jeda panjang, dengan tim infra siaga.

### E1. Ubah record root

Cloudflare → record `sdidarussalamcikunir.sch.id` → Edit:

- Type: `A`
- IPv4: `187.77.146.164`
- Proxy: **DNS only** (abu-abu)

### E2. Ubah record `www`

Record `www` bertipe CNAME → hapus, lalu **Add record**:

- Type: `A`
- Name: `www`
- IPv4: `187.77.146.164`
- Proxy: **DNS only**

Yang dicari (dari laptop):

```bash
nslookup www.sdidarussalamcikunir.sch.id 1.1.1.1
nslookup sdidarussalamcikunir.sch.id 1.1.1.1
```

Keduanya → `187.77.146.164`.

### E3. Minta infra mengaktifkan blok Caddy production

Pesan singkat: "DNS `www` dan root sudah ke VPS (DNS only), `127.0.0.1:3000`
sehat. Silakan aktifkan blok production dan pasang cron cleanup-tokens."

Yang dicari: `https://www.sdidarussalamcikunir.sch.id` terbuka dengan gembok
(sertifikat Let's Encrypt).

---

## F. Verifikasi & membuka lagi

### F1. Periksa situs

- [ ] Landing page tampil, angka hero benar, **semua foto tampil**
- [ ] `/event` tampil
- [ ] Admin: login (akan diminta login ulang — wajar), daftar pendaftar sama
      dengan sebelum pindah
- [ ] Unggah/ganti satu foto → tampil, berkasnya `644` di
      `/var/lib/pmb/production/uploads/`

### F2. Arahkan DOKU production ke server

DOKU Back Office (akun **production**) → Notification URL:

```
https://www.sdidarussalamcikunir.sch.id/api/payments/doku/notification
```

Tiap transaksi sebenarnya membawa alamat notifikasinya sendiri
(`override_notification_url`, diambil dari `SITE_URL`), tapi setelan di Back
Office tetap disamakan supaya tidak ada dua alamat yang berbeda.

### F3. Buka lagi pendaftaran

Admin `www` (sekarang VPS) → **Pembayaran** → kembalikan tanggal buka/tutup yang
dicatat di B1.

Yang dicari: tombol daftar di landing page aktif lagi.

### F4. Uji pembayaran sungguhan (opsional tapi disarankan)

Satu pendaftaran uji dengan pembayaran **nyata** sampai pendaftar muncul di
admin dan email struk masuk. Setelah itu hapus pendaftar uji dari admin, dan
catat transaksinya untuk bagian keuangan.

---

## Mundur — bila ada yang gagal

| Gagal di | Cara mundur |
|---|---|
| A, C, D | Tidak ada yang berubah untuk publik. Buka lagi pendaftaran di situs lama (B1 dibalik), selesai. `pmb_production` boleh diisi ulang kapan saja (`copy-db --truncate`) |
| E atau F | 1. Kembalikan dua record DNS ke nilai A2 (Proxied/oranye). 2. Buka lagi pendaftaran di situs lama. Vercel masih menyajikan deployment lamanya karena auto-deploy sudah diputus di B2 — jangan dihubungkan ulang sebelum `main` dikembalikan ke kode lama |

Pendaftar yang sempat masuk ke VPS sebelum mundur **tidak** otomatis kembali ke
Supabase — catat dari admin VPS dan masukkan manual.

---

## G. Bersih-bersih — beberapa hari setelah stabil

- [ ] Hapus `web/vercel.json`
- [ ] Hapus cadangan `NEXT_PUBLIC_SITE_URL` di `modules/shared/siteUrl.ts`
- [ ] Hapus project di Vercel
- [ ] Supabase production: biarkan hidup ±1 minggu sebagai cadangan, lalu pause
      atau hapus, dan **ganti sandi database-nya** (pernah lewat chat)
- [ ] Supabase staging: idem
- [ ] Hapus `web/.env.production.local` dan folder `uploads-pmb-production` di
      laptop
- [ ] Pantau `/api/cron/cleanup-tokens` berjalan tiap 03.00 — infra memasang
      pemantau stempel 26 jam
