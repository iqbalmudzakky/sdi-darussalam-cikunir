# PRD — Alur Pendaftaran Baru (PMB & Pindahan)

**Proyek:** Website SD Islam Darussalam Cikunir (`sdi-darussalam-cikunir`)
**Status:** Draft v0.2 — menunggu persetujuan
**Tanggal:** 2026-11-14
**Acuan:** `Form PMB Lengkap.xls` (FORM BIODATA, Pernyataan keuangan, Surat Ket Diterima) dan
`Form Observasi Fix.xlsx` (Petunjuk, Input Observasi, Profil Kesiapan) dari sekolah.

Konvensi kode, migrasi, dan clean code tetap mengikuti PRD v0.1 bab 6.

---

## 1. Latar Belakang

### 1.1 Alur sekarang

Orang tua mengisi form lengkap, **membayar lewat DOKU, baru data tersimpan**. Setelah itu
semua proses (tes, wawancara, surat) berjalan di kertas dan Excel.

Masalahnya:

- Orang tua harus bayar dulu sebelum tahu ada tes dan wawancara. Banyak yang mundur.
- Form lengkap terlalu panjang untuk langkah pertama.
- Guru mengetik ulang data anak ke lembar observasi, surat pernyataan, dan surat diterima.
- Sekolah tidak tahu berapa calon pendaftar untuk tahun-tahun berikutnya.

### 1.2 Alur baru

```
Orang tua                    Panitia (admin PMB)               Sistem
─────────                    ───────────────────               ──────
Pilih PMB / Pindahan
Isi form pendek ──────────────────────────────────────────────> simpan, status Baru
Diarahkan ke WA CP ─────────> CP cari nama di admin
                             Klik "Kirim form lengkap" ───────> link khusus ke WA ortu
Isi form lengkap (terisi) ────────────────────────────────────> data dilengkapi
                             Catat jadwal tes + pewawancara ──> status Terjadwal
                                                               email pengingat H-1 ke ortu
Datang ke sekolah
  bayar biaya pendaftaran ──> Tandai lunas / DOKU
  anak dites ───────────────> PMB: isi observasi 56 indikator
                             Pindahan: tes manual, catat hasil
  ortu diwawancara ─────────> isi surat pernyataan keuangan
                             Putuskan hasil ──────────────────> status Diterima / Tidak Diterima
                             Buat Surat Keterangan Diterima
                             Unduh PDF / Kirim ke WA ─────────> hanya bila sudah lunas
```

Satu pendaftar = satu baris data dari awal sampai akhir. Data yang sudah diisi tidak pernah
diketik dua kali, tapi tetap bisa diubah.

---

## 2. Keputusan yang Sudah Diambil

| #   | Keputusan                                                                                                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K1  | Tidak ada pembayaran sebelum form terkirim                                                                                                                                                 |
| K2  | Klik "Daftar" → pilih **PMB** atau **Siswa Pindahan**                                                                                                                                      |
| K3  | Form pendek: nama anak, jenis kelamin, tanggal lahir, asal sekolah, program, tahun ajaran target, nama & no. WA orang tua, email (opsional)                                                 |
| K4  | Program **Tahfizh / Unggulan** dipilih orang tua                                                                                                                                           |
| K5  | Tahun ajaran target: TA yang sedang dibuka sampai +5 (contoh sekarang: 2027/2028 – 2032/2033)                                                                                              |
| K6  | Setelah kirim form pendek → langsung ke WhatsApp CP dengan pesan terisi                                                                                                                    |
| K7  | Form lengkap lewat link khusus dari CP. Isian form pendek sudah terisi dan bisa diubah. Email wajib di sini                                                                                |
| K8  | Tidak ada unggah berkas. Panitia mencentang berkas kertas yang sudah diterima (akta, KK, KTP ayah & ibu; rapor & NISN untuk pindahan)                                                      |
| K9  | Jadwal tes cukup tanggal + jam yang dicatat CP. Tanpa sistem slot                                                                                                                          |
| K10 | Pengingat: email otomatis H-1 ke orang tua + daftar "Jadwal hari ini & besok" di dashboard dengan tombol WA manual. Tanpa WA otomatis                                                       |
| K11 | Pewawancara anak & pewawancara orang tua dipilih dari akun PMB. Guru boleh "Ambil" sendiri; kepsek/wakepsek boleh menugaskan siapa saja                                                    |
| K12 | Biaya pendaftaran dibayar di sekolah saat tes: tunai/transfer (ditandai lunas) atau DOKU                                                                                                   |
| K13 | Profil Kesiapan & Surat Keterangan Diterima hanya bisa diunduh/dikirim **setelah biaya pendaftaran lunas**                                                                                 |
| K14 | Dokumen dikirim ke orang tua sebagai **link PDF lewat WA**, bukan lampiran (lampiran butuh WhatsApp Business API berbayar). Tombol "Unduh PDF" untuk dicetak                                |
| K15 | Nominal surat pernyataan diatur dari website, hanya oleh kepsek (dan admin dev)                                                                                                            |
| K16 | Pindahan: alur sama persis, **kecuali tes murid** — dikerjakan manual sesuai jenjang kelas, tanpa 56 indikator, jadi tanpa Profil Kesiapan                                                 |
| K17 | Angka pendaftar dihitung per **tahun ajaran target**. Landing page = TA yang sedang dibuka. Statistik = rincian per TA target                                                              |
| K18 | Peran akun diganti: Kepsek, Wakepsek, TU, Guru, Admin (dev)                                                                                                                                |
| K19 | Nomor pendaftaran: urut per TA target, mis. `2728-001`                                                                                                                                     |
| K20 | WA setelah form pendek ke **satu nomor CP PMB**. CP di Surat Diterima (bagian pembayaran uang masuk) berbeda dan di luar alur website — keduanya diatur kepsek                              |
| K21 | Usia per 1 Juli: ≥ 6 tahun = Cukup. Di bawah 6 tahun = dengan persyaratan khusus, orang tua diminta menghubungi CP PMB                                                                      |
| K22 | Nomor surat: `<urut>.09/PMB-SDI-DC/<bulan Romawi>/<tahun>`. `09` = nomor unit SDI Darussalam Cikunir di yayasan                                                                            |
| K23 | PDF dibuat dengan `@react-pdf/renderer`                                                                                                                                                    |
| K24 | Input Pendaftar Manual tetap ada, diisi guru dengan **form lengkap** langsung                                                                                                              |

### 2.1 Hasil observasi bukan penentu otomatis

Lembar Petunjuk menyebut: _"Hasil bukan diagnosis dan bukan satu-satunya dasar penerimaan."_
Jadi Profil Kesiapan hanya **bahan pertimbangan**. Diterima atau tidak tetap dipilih panitia.
Ini juga membuat PMB dan Pindahan memakai tombol keputusan yang sama.

### 2.2 Dimensi terkuat/terlemah dihitung dari persentase

Di Excel, "dimensi paling kuat" diambil dari skor mentah. Dimensi dengan indikator terbanyak
(Kesiapan Belajar, maks. 32) hampir selalu menang. Di website dihitung dari **persentase**
(skor ÷ skor maks.). Kalau persentase sama, ambil urutan dimensi paling atas.

### 2.3 Isi surat adalah salinan, bukan data induk

Saat surat pertama dibuat, isinya diambil dari data pendaftar. Setelah itu yang diubah di surat
**hanya mengubah surat**. Alasannya: surat yang sudah dicetak dan ditandatangani tidak boleh
berubah diam-diam saat biodata diperbaiki. Kalau biodata diperbaiki sesudahnya, ada tombol
"Ambil ulang dari biodata".

---

## 3. Status Pendaftar

| Kode       | Label          | Kapan                                         |
| ---------- | -------------- | --------------------------------------------- |
| `new`      | Baru           | Form pendek masuk                             |
| `scheduled`| Terjadwal      | Jadwal tes dicatat (otomatis)                 |
| `tested`   | Sudah Tes      | Observasi atau hasil tes manual disimpan (otomatis) |
| `accepted` | Diterima       | Panitia memilih Diterima                      |
| `rejected` | Tidak Diterima | Panitia memilih Tidak Diterima                |
| `cancelled`| Batal          | Orang tua mundur — bisa dari status mana pun  |

Status berpindah **dari aksi**, bukan dipilih bebas (kecuali Batal). Aturannya di service,
bukan di frontend.

Tiga penanda lain tampil sebagai chip ikon, terpisah dari status:

- **Form lengkap** — sudah/belum diisi orang tua
- **Lunas** — biaya pendaftaran
- **Berkas** — jumlah berkas kertas yang sudah diterima

**Data lama:** `pending` dan `in_progress` → `new`, `registered` → `accepted`,
`not_registered` → `cancelled`.

---

## 4. Peran & Hak Akses

| Hak                                  | Kepsek | Wakepsek | TU  | Guru               | Admin (dev) |
| ------------------------------------ | ------ | -------- | --- | ------------------ | ----------- |
| Undang & ubah akun                   | ✓      |          |     |                    | ✓           |
| Atur nominal & isi tetap surat       | ✓      |          |     |                    | ✓           |
| Tandai lunas biaya pendaftaran       | ✓      | ✓        |     |                    | ✓           |
| Jadwal tes, "Ambil" pendaftar        | ✓      | ✓        | ✓   | ✓                  | ✓           |
| Tugaskan pewawancara ke orang lain   | ✓      | ✓        |     |                    | ✓           |
| Isi observasi & surat pernyataan     | ✓      | ✓        |     | ✓ (yang ditugaskan)| ✓           |
| Putuskan hasil & buat surat diterima | ✓      | ✓        |     | ✓ (yang ditugaskan)| ✓           |
| Konten website                       | ✓      | ✓        | ✓   | ✓                  | ✓           |

- Kode peran (Inggris): `principal`, `vice_principal`, `administration_staff`, `teacher`,
  `developer`. Label di layar: Kepsek, Wakepsek, TU, Guru, Admin.
- Kode `developer`, **bukan `admin`**. Nilai `admin` yang lama artinya admin biasa. Kalau dipakai
  ulang untuk "semua hak", akun lama bisa tiba-tiba punya semua hak.
- Akun Admin tidak muncul di daftar pewawancara.
- Hak dicek di service lewat satu daftar hak per peran (`modules/shared/constant`), bukan
  `role === "superadmin"` yang tersebar di 33 tempat seperti sekarang.
- Guru yang menguji boleh memutuskan hasil dan membuat surat. Yang tidak boleh untuk guru (dan
  TU): menandai lunas biaya pendaftaran — itu hanya kepsek atau wakepsek.

**Pemetaan akun lama** (lewat migrasi): `superadmin` → `principal`, `admin` → `teacher`. Setelah
deploy, peran yang tidak pas diubah dari halaman Akun (akun developer dibuat dari situ juga).

---

## 5. Model Data

Prinsip: **menambah**, bukan mengganti. Tabel `ppdb_registrations` dan turunannya tetap dipakai.

### 5.1 Perubahan tabel yang ada

**`ppdb_registrations`**

| Kolom                  | Isi                                                                 |
| ---------------------- | ------------------------------------------------------------------- |
| `registration_number`  | Nomor pendaftaran untuk dicari CP dan ditulis di WA (format: P1)    |
| `program`              | `tahfizh` / `unggulan`                                              |
| `academic_year`        | **Kini berarti TA target** (sudah ada, artinya diperjelas)          |
| `contact_name`         | Nama orang tua dari form pendek                                     |
| `contact_relation`     | `father` / `mother` / `guardian`                                    |
| `contact_phone`        | No. WA orang tua                                                    |
| `full_form_completed_at` | Kapan form lengkap dikirim orang tua                              |
| `received_documents`   | `text[]` berisi kode berkas yang sudah diterima                     |
| `status`               | Nilai baru (bab 3)                                                  |

**`ppdb_registration_students` / `_parents`** — kolom yang tidak ada di form pendek dibuat boleh
kosong (`DROP NOT NULL`). Wajib-tidaknya dicek di zod saat form lengkap dikirim.

Kolom baru dari FORM BIODATA:

- Siswa: `postal_code`, `previous_school_npsn`, `previous_school_address`,
  `birth_certificate_number`, `kks_number`, `kps_number`, `pkh_number`, `kip_number`,
  `latitude`, `longitude`, `travel_time`
- Orang tua: `special_needs`; `parent_type` ditambah `guardian` untuk data wali
- Tabel baru `ppdb_registration_achievements` (jenis, tingkat, nama, tahun, penyelenggara)

**`registration_payments`** — `registration_id` diisi **sejak pembayaran dibuat**, karena kini
pendaftar sudah ada lebih dulu. Kolom baru `recorded_by` (akun yang menandai lunas).

**`admin_users.role`** — nilai baru (bab 4).

### 5.2 Tabel baru

| Tabel                       | Domain               | Isi                                                                               |
| --------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `registration_form_links`   | `registration-link`  | Token link form lengkap (hash), kedaluwarsa, dibuat oleh                          |
| `admission_tests`           | `admission-test`     | Jadwal tes, pewawancara anak, pewawancara ortu, catatan tes manual, pengingat terkirim |
| `observations`              | `observation`        | Tanggal, observer, catatan awal, rekomendasi                                      |
| `observation_scores`        | `observation`        | 56 baris: nomor indikator, skor 1–4, catatan                                      |
| `admission_settings`        | `admission-settings` | Satu baris: nominal per program, diskon, batas bayar, rekening, penanda tangan, CP PMB, CP surat |
| `financial_statements`      | `financial-statement`| Salinan isi surat pernyataan (jsonb) + tanggal tanda tangan                       |
| `acceptance_letters`        | `acceptance-letter`  | Nomor surat, tanggal, salinan isi surat (jsonb)                                   |
| `document_links`            | `acceptance-letter`  | Token link PDF untuk orang tua (hash), kedaluwarsa                                |

- **Daftar 56 indikator dan 9 dimensi disimpan di kode** (`modules/shared/constant`), bukan di
  tabel. Isinya tetap dan berubah paling sekali setahun lewat rilis. Skor menyimpan nomor
  indikator.
- **Token** disimpan sebagai hash, sama seperti token undangan admin.
- **Dua jenis CP di `admission_settings`:** satu nomor **CP PMB** (tujuan WA setelah form pendek,
  dan yang dihubungi bila usia di bawah 6 tahun), dan daftar **CP surat** ("Contact" di bawah
  Surat Diterima, urusan pembayaran uang masuk).
- **Usia per 1 Juli** tahun masuk dihitung di service (Excel: DATEDIF ke 1 Juli).

### 5.3 Hitungan pendaftar

`registration-stats` sudah menghitung per `academic_year`. Karena kolom itu kini TA target,
landing page otomatis menampilkan TA yang sedang dibuka. `offline_count` tetap ada untuk
pendaftar kertas yang tidak diinput.

---

## 6. Daftar Fitur

### F1 — Peran baru

- Migrasi peran (bab 4), halaman Akun memakai 5 peran.
- Menu sidebar dan tombol mengikuti hak, bukan `superadminOnly`.

### F2 — Form pendek & WhatsApp

- Tombol "Daftar" membuka pilihan **PMB / Siswa Pindahan**.
- Form pendek (K3). Tetap ada pengecekan duplikat dan pembatas per IP.
- Setelah kirim: halaman terima kasih singkat (ada tes & wawancara, biaya pendaftaran
  Rp … dibayar di sekolah saat tes), lalu **langsung dibuka WA CP PMB** dengan pesan:
  nama anak, nomor pendaftaran, program, TA.
- PMB: bila usia anak per 1 Juli TA target di bawah 6 tahun, tampil chip singkat
  "Di bawah 6 tahun — persyaratan khusus, hubungi sekolah". Form tetap bisa dikirim.
- Pembayaran DOKU di depan form **dihapus**.

### F3 — Form lengkap lewat link

- Di detail pendaftar, tombol **"Kirim form lengkap"** → WA terbuka ke nomor orang tua dengan link.
- Link membuka form lengkap (isi FORM BIODATA) yang sudah terisi. Bisa dibuka lagi sampai
  hari tes. CP bisa kirim ulang (link lama tidak berlaku).
- Form lengkap = `RegistrationForm.tsx` yang ada, dipecah per bagian (berkas ini 1.164 baris,
  kena aturan clean code karena disentuh).

### F4 — Daftar & detail pendaftar (admin)

- Daftar: cari nama/nomor, saring status, TA target, program, PMB/Pindahan.
- Detail: biodata, chip Form lengkap/Lunas/Berkas, jadwal, pewawancara, tombol aksi sesuai tahap.
- Centang berkas kertas (K8).
- **Input Pendaftar Manual** (K24): guru langsung mengisi form lengkap, sumber `offline`, status
  Baru. Tidak ada isian pembayaran di sini lagi — lunas dicatat lewat F6.
- `registrations/page.tsx` (910 baris) dipecah karena disentuh.

### F5 — Jadwal tes & pewawancara

- CP mengisi tanggal + jam → status Terjadwal.
- Pewawancara anak & ortu: dropdown dengan kolom cari dari akun PMB; tombol **"Ambil"** untuk
  diri sendiri.
- Dashboard: kartu **"Jadwal hari ini & besok"** dengan tombol WA pengingat per pendaftar.
- Email pengingat H-1 ke orang tua yang punya email: route cron
  `/api/cron/send-test-reminders`, sekali sehari. Dicatat supaya tidak terkirim dua kali.

### F6 — Pembayaran biaya pendaftaran

- **Tandai lunas**: pilih Tunai/Transfer, nomor kuitansi opsional. Tercatat siapa dan kapan.
  Pembatalan lunas hanya kepsek/admin.
- **DOKU**: tombol "Bayar lewat DOKU" membuat link pembayaran untuk pendaftar itu. Link bisa
  dibuka di HP orang tua (kirim WA). Lunas otomatis dari notifikasi DOKU, seperti sekarang.
- Halaman Transaksi tetap, kini selalu terhubung ke pendaftar.

### F7 — Observasi & Profil Kesiapan (PMB saja)

- Layar isi 56 indikator per dimensi: skor 1–4 dengan tombol (bukan ketik), catatan per
  indikator opsional. Keterangan skor dari lembar Petunjuk tampil sebagai ikon info.
- Header terisi dari biodata: nama, nomor, tanggal lahir, asal TK, usia per 1 Juli, observer.
- Profil Kesiapan dihitung di service: per dimensi (skor, maks., kategori), total, kesimpulan,
  dimensi terkuat & terlemah (2.2), catatan/rekomendasi diketik observer.
- Simpan → status Sudah Tes.

### F8 — Tes manual (Pindahan)

- Cukup catatan hasil tes + tanggal. Simpan → status Sudah Tes.

### F9 — Surat pernyataan keuangan

- Terisi dari biodata (ayah, ibu, alamat, anak, kelas, TA) dan `admission_settings` (nominal
  program pilihan, diskon sesuai asal TK).
- Bisa diubah (2.3). Cetak PDF untuk ditandatangani.

### F10 — Hasil & Surat Keterangan Diterima

- Tombol **Diterima / Tidak Diterima** → status.
- Diterima → Surat Keterangan Diterima terisi: nomor surat, nama, asal sekolah, kelas + program,
  usia, batas bayar, rekening, penanda tangan, CP surat. Bisa diubah.
- Nomor surat otomatis (K22): nomor urut naik per tahun surat, bisa diubah. Kode unit `09` dan
  `PMB-SDI-DC` tetap di kode.
- Usia: "6 Tahun 7 Bulan (Cukup)" bila ≥ 6 tahun per 1 Juli; di bawahnya
  "(Dengan persyaratan khusus)".

### F11 — Dokumen untuk orang tua

- Tombol **Unduh PDF** dan **Kirim ke WA** untuk Profil Kesiapan (PMB) dan Surat Diterima.
- Keduanya terkunci sampai Lunas (K13). Penguncian dicek di backend, bukan hanya tombol disembunyikan.
- Kirim ke WA → link `/dokumen/<token>` yang menampilkan tombol unduh kedua PDF.

### F12 — Pengaturan PMB (kepsek)

- Halaman baru: nominal per program (uang awal tahun, iuran Juli), diskon lulusan TK Darussalam /
  TK lain, batas pembayaran, rekening, nama penanda tangan, daftar CP.
- Biaya pendaftaran tetap di halaman Pembayaran yang sekarang.

### F13 — Statistik pendaftar

- Rincian per **TA target**: total, per status (alur Baru → Terjadwal → Sudah Tes → Diterima),
  per program, PMB/Pindahan, online/offline.
- Didesain dulu di FigCraft (HP, tablet, desktop) sebelum dikodekan. Data harus cepat dibaca:
  angka utama besar, perbandingan dengan bar, bukan tabel panjang.

---

## 7. Migrasi

Semua migrasi wajib aman untuk container lama yang masih jalan beberapa detik (PRD v0.1 6.3).
Karena itu perubahan nilai `CHECK` dibuat **dua langkah**:

1. PR yang memperkenalkan nilai baru: `CHECK` menerima nilai lama **dan** baru, lalu data lama
   dipetakan.
2. PR berikutnya: nilai lama dibuang dari `CHECK`.

Berlaku untuk `admin_users.role` dan `ppdb_registrations.status`.

`DROP NOT NULL` dan kolom/tabel baru aman langsung.

**Pembayaran DOKU yang menggantung:** saat F2 rilis, sesi DOKU lama (bayar dulu, data belum
tersimpan) yang masih `pending` dibiarkan bisa selesai sampai kedaluwarsa. Jalur
`settleAsRegistration` baru dihapus di PR berikutnya.

---

## 8. Tahapan Pengerjaan

| PR  | Isi                                         | Fitur          |
| --- | ------------------------------------------- | -------------- |
| 1   | Peran baru                                  | F1             |
| 2   | Form pendek, WA, form lengkap, status baru  | F2, F3, F4     |
| 3   | Jadwal, pewawancara, pengingat, pembayaran  | F5, F6         |
| 4   | Observasi, tes manual, Profil Kesiapan      | F7, F8         |
| 5   | Surat-surat, PDF, pengaturan PMB            | F9, F10, F11, F12 |
| 6   | Statistik + buang nilai lama dari `CHECK`   | F13, bab 7     |

Setiap PR: **kode → review → deploy staging → uji → deploy production**, dengan aturan rilis:

- **PR 1 rilis sendiri ke production.** Tidak mengubah alur pendaftar, dan peran baru perlu
  dicoba di production sebelum alur baru bergantung padanya.
- **PR 2–5 ditahan di `staging`, lalu dirilis ke production bersamaan** setelah PR 5 lolos uji.
  PR 2 membuang pembayaran di depan. Kalau rilis sendiri, pendaftar masuk tanpa bayar padahal
  layar tes, lunas, dan surat belum ada — sekolah terjebak di alur setengah jadi.
- **PR 6 rilis sendiri** setelah alur baru berjalan di production (membuang nilai lama `CHECK`
  harus menunggu container lama benar-benar hilang).
- Selama PR 2–5 ditahan, perbaikan mendesak untuk production dibuat dari branch `main`
  langsung, lalu digabung balik ke `staging`.
- Layar baru (form pendek, detail pendaftar, observasi, surat, statistik) didesain dulu di
  FigCraft per PR, disetujui, baru dikodekan.

---

## 9. Butuh Pihak Lain

- **Infra:** cron harian untuk `/api/cron/send-test-reminders` (PR 3). Pesan disiapkan saat
  route-nya siap.
- **Library PDF baru:** `@react-pdf/renderer` (K23). Berjalan di Node biasa, tanpa browser
  headless, jadi ringan untuk server.

---

## 10. Pertanyaan Terbuka

Semua pertanyaan P1–P8 sudah dijawab 14 Nov 2026 dan masuk ke K19–K24, bab 4, dan bab 8.

| #   | Asumsi yang belum dikonfirmasi                                                     |
| --- | ---------------------------------------------------------------------------------- |
| A1  | Nomor urut surat mulai dari 001 lagi tiap tahun kalender surat                      |
| A2  | Nomor urut pendaftaran mulai dari 001 per TA target                                 |

---

## 11. Risiko

| Risiko                                                         | Penanganan                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Form pendek tanpa bayar mengundang data iseng                  | Pembatas per IP tetap; status Batal; CP menyaring saat menghubungi        |
| Link form lengkap/dokumen bocor                                | Token acak, disimpan hash, kedaluwarsa, bisa dibuat ulang                 |
| Container lama menulis nilai lama saat migrasi                 | `CHECK` dua langkah (bab 7)                                              |
| PDF berat di server                                            | Dibuat saat diminta, sekali per anak; library tanpa browser              |
| Berkas lama yang disentuh besar (RegistrationForm, registrations page, repository) | Dipecah sesuai PRD v0.1 6.6 di PR yang menyentuhnya         |

---

## 12. Backlog

- WhatsApp otomatis (pengingat & dokumen) lewat WhatsApp Business API
- Sistem slot jadwal tes
- QR pembayaran DOKU di layar
- Daftar indikator observasi bisa diubah dari website
