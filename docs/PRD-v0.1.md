# PRD — Statistik Pendaftar, Event Sekolah & Alur Pendaftaran Baru

**Proyek:** Website SD Islam Darussalam Cikunir (`sdi-darussalam-cikunir`)
**Status:** Draft v0.1
**Tanggal:** 2026-09-11
**Cakupan:** dua permintaan sekolah — angka total pendaftar (online + offline) di landing
page, dan halaman event sekolah (`/event`) yang diisi sendiri oleh admin. Sejak 14 Nov 2026
ditambah alur pendaftaran baru PMB & pindahan (bab 11).

---

## 1. Latar Belakang

### 1.1 Kenapa dibangun

Dua hal datang dari sekolah, dan keduanya soal yang sama: **apa yang orang lihat dari
luar**.

**Pertama, angka pendaftar.** Sekolah ingin jumlah pendaftar tampil di website. Pendaftar
online sudah tercatat rapi di database — tinggal dihitung. Pendaftar offline (formulir
kertas di sekolah) jumlahnya banyak dan tidak realistis diinput satu per satu lewat form
manual yang sudah ada; sekolah minta cukup **satu angka yang diketik admin**.

**Kedua, event sekolah.** Setiap ada kegiatan besar — PMB, Akram, peringatan 17 Agustus, siswa
yang menang lomba — sekolah membuat poster dan menyebarnya lewat **status WhatsApp**.
Status WA hilang dalam 24 jam, tidak bisa dicari, dan tidak bisa dikirim sebagai tautan.
Semua kerja desain dan semua momen itu menguap. Website punya trafik dan sudah terindeks,
tapi tidak punya tempat untuk menaruhnya.

### 1.2 Penomoran versi

Aplikasi ini **sudah berjalan di produksi**, jadi penomoran PRD di sini bukan penomoran
rilis aplikasi — ia penomoran dokumen.

| Versi         | Arti                                                     |
| ------------- | -------------------------------------------------------- |
| v0.1          | PRD pertama di repo ini — dokumen ini                    |
| v0.2, v0.3, … | PRD berikutnya, satu berkas per PRD (`docs/PRD-v0.2.md`) |

PRD lama **tidak disunting** saat PRD baru ditulis. Ia catatan tentang apa yang dikerjakan
waktu itu dan kenapa.

**Branching:** ikut yang sudah berjalan — kerja di branch fitur, PR ke `staging`, lalu
`staging` ke `main`.

### 1.3 Yang sudah ada dan tidak diulang di sini

Bagian ini penting supaya fitur baru tidak menabrak yang sudah jalan.

| Sudah ada                         | Bentuknya sekarang                                                                                                               |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Section **Kegiatan** di landing   | `components/sections/Activity.tsx` + tabel `activities`, CRUD di `/admin/activity`. Foto 4:3 / video YouTube, badge teks bebas   |
| Section **Prestasi Kami**         | Bagian bawah `ActivityContent.tsx` + tabel `achievements`. Hanya emoji + judul + deskripsi, **tanpa foto dan tanpa tanggal**     |
| Angka di hero (`683 Siswa aktif`) | **Hardcode** di `components/sections/Hero.tsx` baris 9–13, bukan dari database                                                   |
| Pendaftaran online                | `ppdb_registrations` + `ppdb_registration_students/parents/details`, bayar lewat DOKU                                            |
| Pendaftaran offline               | Form yang sama, mode `manual`, lewat `/admin/registrations/new` → `POST /api/registrations`. **Membuat record asli di database** |
| Pembayaran offline                | `registration_payments.source` sudah membedakan `'online'` dan `'manual'`                                                        |
| Pengaturan bernilai tunggal       | Tabel `payment_settings` dengan `singleton_guard` — pola yang dipakai ulang di dokumen ini                                       |
| Unggah foto                       | `POST /api/storage/upload` + bucket Supabase per fitur, daftar bucket diizinkan di route-nya                                     |
| Hak akses admin                   | `requireUser()` di tiap route, peran `admin` / `superadmin`, menu `superadminOnly` di `AdminSidebar`                             |

**Konsekuensi yang harus diingat sepanjang dokumen:** halaman "Input Pendaftar Manual"
menulis record asli. Kalau angka offline diketik admin **tanpa** membedakan sumber, orang
yang sama bisa terhitung dua kali. Bagian 4.1 menyelesaikan ini.

---

## 2. Tujuan & Non-Tujuan

### 2.1 Tujuan

| #   | Tujuan                                                         | Ukuran keberhasilan                                                                                                                                                     |
| --- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | Calon wali melihat berapa orang sudah mendaftar                | Satu angka di landing page yang benar tanpa ada yang menghitung manual                                                                                                  |
| G2  | Admin bisa memasukkan jumlah pendaftar offline sendiri         | Satu layar, satu kolom angka, tersimpan tanpa bantuan developer                                                                                                         |
| G3  | Tidak ada pendaftar yang terhitung dua kali                    | Pendaftar yang diinput lewat form manual **tidak** ikut dijumlahkan ke angka manual (4.1)                                                                               |
| G4  | **Admin bisa mengumumkan event sekolah sendiri lewat website** | Admin mengunggah poster PMB/Akram/17-an beserta tanggal dan keterangannya, menekan terbit, dan event itu langsung tampil di halaman publik — tanpa melibatkan developer |
| G5  | Event yang sudah lewat tidak ikut hilang                       | Seluruh event tersimpan dan tetap bisa dibuka tahun depan, tidak seperti status WA yang habis dalam 24 jam                                                              |
| G6  | Event bisa disebarkan sebagai tautan                           | Tiap event punya URL sendiri yang bisa ditempel ke status/grup WA dan muncul di sana sebagai kartu bergambar poster                                                     |
| G7  | Prestasi siswa bisa tampil berfoto dan bertanggal              | Prestasi masuk sebagai kategori event, lengkap dengan poster dan tanggal                                                                                                |
| G8  | Landing page tidak jadi panjang oleh arsip                     | Landing hanya menampilkan 3 event terbaru; sisanya di halaman sendiri                                                                                                   |
| G9  | Setiap event bisa ditemukan lewat pencarian                    | Tiap event punya URL sendiri, metadata OG, dan terdaftar di sitemap                                                                                                     |
| G10 | Halaman publik enak dibuka dari HP                             | Seluruh halaman baru dirancang dari lebar 390 px dulu, baru dilebarkan — lihat 6.5                                                                                      |
| G11 | Jumlah siswa & guru diperbarui admin, bukan developer          | Admin mengubah "Siswa aktif" dan "Guru & staf" dari dashboard dan angka di hero ikut berubah tanpa deploy                                                               |

### 2.2 Non-Tujuan (v0.1)

Sengaja **tidak** dikerjakan sekarang:

- **Angka hero yang jarang berubah** (`16+ Tahun berdiri`, `Akreditasi A`) — tetap
  hardcode. Keduanya berubah sekali dalam beberapa tahun, jadi form untuk mengubahnya
  lebih merepotkan daripada satu baris kode. Yang berubah sering — siswa aktif dan guru &
  staf — justru **masuk cakupan**, lihat F3
- Rincian online vs offline di halaman publik — publik hanya melihat **totalnya** (3.1)
- Statistik pendaftar per gelombang, per kelurahan, atau grafik tren
- Kalender agenda dengan tampilan bulanan
- Notifikasi WhatsApp / broadcast otomatis saat event terbit
- Komentar, jumlah dilihat, tombol suka
- Editor teks kaya (WYSIWYG) — isi event ditulis sebagai teks biasa berparagraf
- Galeri banyak foto per event — satu poster per event
- Mengubah atau memindahkan section **Kegiatan** dan **Prestasi** yang sudah ada

---

## 3. Keputusan yang Sudah Diambil

Keputusan berikut sudah disepakati sebelum dokumen ini ditulis. Dicatat beserta alasannya
supaya tidak dibongkar ulang di tengah jalan.

| #   | Keputusan                                                                      | Alasan                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1  | Landing page menampilkan **total gabungan saja**                               | Rincian kanal pendaftaran urusan internal. Total juga membuat koreksi angka offline tidak terlihat janggal di publik                                                                             |
| D2  | Input offline berupa **satu angka per tahun ajaran**                           | Sesuai permintaan sekolah, paling ringan diisi, dan angka tahun lalu tetap tersimpan alih-alih tertimpa                                                                                          |
| D3  | Sumber pendaftaran **ditandai di record** (`online` / `offline`)               | Menghapus risiko hitung ganda di pangkalnya, bukan mengandalkan admin mengingat. Sekaligus membuat pertanyaan "berapa yang daftar offline?" bisa dijawab data                                    |
| D4  | Event punya **halaman sendiri** (`/event`), dengan teaser 3 terbaru di landing | Poster WA berbentuk portrait dan tidak muat di grid 4:3 Kegiatan; tiap event butuh URL sendiri supaya bisa dikirim; landing tetap fokus ke PPDB                                                  |
| D5  | **Siswa aktif & guru/staf** ikut bisa diedit admin, angka hero lain tidak      | Jumlah siswa berubah nyaris tiap hari; mengubah kode untuk itu membuang waktu developer dan menunda tampilnya angka yang benar. Tahun berdiri dan akreditasi berubah bertahun sekali — lihat 3.3 |

### 3.1 Kenapa publik hanya melihat total

Angka offline diketik manusia dan akan sesekali dikoreksi. Kalau publik melihat
`online: 180 · offline: 132`, setiap koreksi jadi pengumuman. Dengan satu angka total,
koreksi wajar terjadi tanpa menarik perhatian, dan tidak ada informasi yang hilang bagi
pembacanya — yang ingin mereka tahu adalah "ramai atau tidak".

Rincian tetap ada, hanya tempatnya di dashboard admin (F2).

### 3.2 Penamaan: kenapa "Event", bukan "Kegiatan"

Landing page sudah memakai anchor `#kegiatan` untuk section Kegiatan (`Navbar.tsx` baris
14). Memakai `/kegiatan` untuk halaman baru berarti dua hal berbeda berebut satu nama, dan
menu navigasi punya dua entri yang bunyinya sama.

Jadi:

| Nama                         | Isi                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------- |
| **Kegiatan** (`#kegiatan`)   | Yang sudah ada — kegiatan rutin/keseharian sekolah, tidak terikat tanggal       |
| **Event Sekolah** (`/event`) | Yang dibangun di sini — peristiwa bertanggal: PMB, Akram, 17-an, prestasi siswa |

"Event" dipakai untuk dua-duanya: yang **akan** terjadi (PMB, Akram yang sedang
dipersiapkan) maupun yang **sudah** terjadi (17-an tahun lalu, prestasi siswa). Halaman
`/event` mengurutkannya berdasarkan tanggal peristiwa, jadi yang terbaru selalu di atas
tanpa perlu memisahkan "agenda" dan "arsip" menjadi dua tempat.

### 3.3 Angka hero: mana yang diedit admin, mana yang tetap di kode

| Angka di hero    | v0.1                                             |
| ---------------- | ------------------------------------------------ |
| **Siswa aktif**  | **Diedit admin** — berubah nyaris tiap hari      |
| **Guru & staf**  | **Diedit admin** — berubah beberapa kali setahun |
| Pendaftar (baru) | Dihitung otomatis + angka offline manual (4.1)   |
| Tahun berdiri    | Tetap di kode                                    |
| Akreditasi       | Tetap di kode                                    |

Batasnya bukan "mana yang penting", melainkan **seberapa sering berubah**. Angka yang
berubah setahun sekali lebih murah diubah lewat satu baris kode saat deploy berikutnya
daripada dibuatkan kolom database, form, validasi, dan route API yang harus dirawat
selamanya.

**Tempat penyimpanannya: kolom baru di `school_profiles`** (7.4), bukan tabel baru.
Alasannya praktis: `Hero` sudah memanggil `getSchoolProfile()` untuk foto dan video, jadi
kedua angka ini ikut terbawa **tanpa query tambahan**. Tabel itu juga memang sudah menjadi
rumah bagi isi landing page yang bernilai tunggal.

**Tapi tempat mengeditnya di `/admin/statistics`, bukan `/admin/about`.** Halaman Profil
Sekolah adalah formulir panjang berisi visi, misi, alamat, dan tautan media sosial —
tempat yang benar untuk sesuatu yang disunting setahun sekali, dan tempat yang salah untuk
angka yang diubah hampir tiap hari. Angka-angka yang tampil sebagai statistik dikumpulkan
di satu layar pendek. Konsekuensinya: satu tabel disunting dari dua halaman. Itu diterima
secara sadar — kedua kolom ini **tidak** ditampilkan di form Profil Sekolah supaya tidak
ada dua tempat mengubah hal yang sama.

**Pembaruan 16 Nov 2026 — siswa aktif dan guru & staf kini dari SSO, tidak diedit admin.**

- Cron infra memanggil `GET /api/cron/sync-school-stats` (bearer `CRON_SECRET`) tiap jam di
  menit ke-7. Route menarik `GET {SSO_BASE_URL}/api/v1/pmb/sekolah/69881047/statistik`
  dengan header `X-PMB-Token: {SSO_PMB_TOKEN}`, timeout 10 detik, lalu menyimpan
  `siswa_aktif` dan `guru_staf` ke kolom yang sama, plus `stats_synced_at`.
- Definisi dari SSO: siswa aktif = berstatus aktif dan ditempatkan di kelas pada TA aktif;
  guru & staf = guru dan tenaga kependidikan aktif, yang cuti tidak dihitung.
- Gagal (SSO mati, token salah, angka bukan bilangan bulat > 0) → balas **502** dan angka
  lama tetap dipakai. Angka 0 dianggap tidak masuk akal, karena "0 Siswa aktif" lebih
  merusak daripada angka kemarin.
- NPSN di path, bukan id; sama di staging dan production, jadi disimpan sebagai konstanta.
- Halaman Statistik bagian Angka Sekolah hanya menampilkan angka dan waktu sinkron terakhir.
  `PUT /api/school-profile/stats` dihapus.

---

## 4. Model Data

### 4.1 Menghitung pendaftar tanpa hitung ganda

Total yang tampil di landing page adalah:

```
total = (pendaftar tercatat di database untuk tahun ajaran aktif)
      + (angka offline yang diketik admin untuk tahun ajaran aktif)
```

Suku pertama mencakup pendaftar online **dan** pendaftar offline yang sudah terlanjur
diinput lewat form manual. Suku kedua hanya untuk yang **belum** diinput.

Supaya batas itu tidak bergantung pada ingatan admin, dua kolom ditambahkan ke
`ppdb_registrations`:

| Kolom           | Isi                                                                                                |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `source`        | `'online'` untuk pendaftaran lewat website, `'offline'` untuk yang diinput admin lewat form manual |
| `academic_year` | Tahun ajaran pendaftaran itu, misal `'2027/2028'`                                                  |

**Kenapa `source` di `ppdb_registrations`, padahal `registration_payments.source` sudah
ada.** Baris pembayaran bisa tidak ada — pendaftaran yang belum dibayar tetap pendaftaran
dan tetap harus terhitung. Menghitung sumber lewat tabel pembayaran berarti diam-diam
membuang pendaftar yang belum membayar.

**Kenapa `academic_year` disimpan, bukan dihitung dari `created_at`.** Kalau tahun ajaran
disimpulkan dari tanggal, ia berubah setiap kali aturan penyimpulannya diubah, dan
pendaftaran yang masuk di luar jendela pendaftaran (susulan, pindahan di tengah tahun)
tidak punya rumah yang jelas. Satu kolom teks membuat angka tahun lalu tetap sama
selamanya — dan laporan "berapa pendaftar TA 2025/2026?" bisa dijawab tanpa menebak.

Nilainya diisi sekali saat pendaftaran dibuat, diambil dari tahun ajaran yang sedang
aktif (4.2). Baris lama di-backfill lewat migrasi.

**Yang dihitung sebagai "pendaftar online" adalah yang pembayarannya sudah berhasil.**
Ini bukan pilihan yang diambil di sini, melainkan bentuk sistem yang sudah berjalan: baris
`ppdb_registrations` baru dibuat ketika DOKU mengabarkan pembayaran sukses
(`modules/payment/repository.ts` — `insertWithin` dipanggil di dalam transaksi penyelesaian
pembayaran). Orang yang mengisi formulir lalu tidak menuntaskan pembayaran tidak punya
baris pendaftaran, jadi tidak ikut terhitung.

Itu justru definisi yang tepat untuk angka publik — "pendaftar" berarti yang benar-benar
mendaftar, bukan yang membuka formulir. Tapi perlu ditulis di sini supaya tidak ada yang
menganggap angkanya bocor ketika ia berbeda dari jumlah orang yang mengaku sudah mengisi
formulir.

### 4.2 Tahun ajaran

Satu tabel `registration_stats`, satu baris per tahun ajaran:

| Kolom           | Isi                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------- |
| `academic_year` | Kunci utama, format `NNNN/NNNN` dan tahun kedua harus tahun pertama + 1                  |
| `offline_count` | Angka yang diketik admin, ≥ 0                                                            |
| `is_current`    | Penanda tahun ajaran yang sedang berjalan. **Hanya boleh satu baris yang bernilai true** |

Ketunggalan `is_current` dijaga **database**, bukan kode aplikasi — partial unique index.
Alasannya sama dengan `singleton_guard` di `payment_settings`: kalau ada dua tahun aktif,
angka di landing page jadi salah tanpa error apa pun, dan itu jenis kesalahan yang baru
ketahuan setelah dilihat orang banyak.

Kalau tidak ada baris `is_current`, landing page **tidak menampilkan angka apa pun**
(F3) — bukan menampilkan nol. Nol berarti "belum ada yang daftar"; tidak tampil berarti
"belum diatur". Dua hal berbeda.

### 4.3 Event

Satu tabel `events`. Bentuknya sengaja sederhana: satu poster, satu tanggal, teks.

| Kolom          | Catatan                                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`         | Bagian URL, dibuat otomatis dari judul. **Tidak berubah setelah event diterbitkan** — lihat 4.4                                                                                              |
| `title`        | Judul event                                                                                                                                                                                  |
| `category`     | **Teks bebas**, mengikuti pola `activities.badge` yang sudah ada: "PMB", "Akram", "Prestasi", "HUT RI". Beberapa nilai yang sering dipakai diberi warna sendiri, sisanya memakai warna aksen |
| `event_date`   | Tanggal peristiwa, bukan tanggal input. Ini yang menentukan urutan tampil                                                                                                                    |
| `summary`      | Satu-dua kalimat untuk kartu dan untuk deskripsi OG saat link dikirim ke WA                                                                                                                  |
| `body`         | Isi lengkap, teks biasa. Baris kosong = paragraf baru                                                                                                                                        |
| `poster_url`   | Satu gambar, orientasi portrait (4:5 atau 3:4)                                                                                                                                               |
| `is_published` | Draf tidak tampil di publik. Poster sering disiapkan jauh hari                                                                                                                               |

**Kenapa kategori teks bebas, bukan daftar tertutup.** Sekolah membuat kegiatan baru
setiap tahun. Daftar tertutup berarti setiap kegiatan baru butuh developer dan migrasi
database — dan pola yang sama sudah terbukti jalan di `activities.badge`. Ongkosnya:
salah ketik menghasilkan kategori baru. Itu ditangani dengan menyarankan kategori yang
sudah pernah dipakai di form admin, bukan dengan mengunci kolomnya.

### 4.4 Slug tidak boleh berubah setelah terbit

Begitu link disebar ke status WA dan grup wali murid, link itu di luar kendali kita. Kalau
slug ikut berubah saat judul disunting, semua link yang sudah tersebar mati.

Aturannya: slug dibuat dari judul **saat event pertama kali diterbitkan**, lalu dikunci.
Menyunting judul setelah itu tidak mengubah slug. Kalau slug hasil olahan sudah dipakai,
tambahkan akhiran angka (`akram-2026`, `akram-2026-2`).

**Slug pada draf.** Kolom `slug` di 7.3 bertipe `NOT NULL`, jadi draf pun butuh slug sejak
dibuat — aturan di atas mengasumsikan ada momen "pertama terbit" tapi tidak bilang apa yang
terjadi sebelum itu. Yang diimplementasikan (M5, `modules/event/service.ts`): slug dibuat
dari judul saat event dibuat sebagai draf, dan **ikut berubah mengikuti judul** selama event
itu belum pernah diterbitkan sekali pun. Begitu status Terbitkan dinyalakan untuk pertama
kalinya, slug dihitung ulang dari judul final saat itu lalu dikunci permanen — mematikan
lalu menerbitkan ulang event yang sama tidak membuka kunci ini.

### 4.5 Hubungan dengan Kegiatan & Prestasi yang sudah ada

Tidak ada yang dipindahkan atau dihapus di v0.1.

- **Kegiatan** (`activities`) tetap sebagaimana adanya — isinya kegiatan rutin, tidak
  bertanggal, dan sudah cocok dengan bentuk kartunya
- **Prestasi** (`achievements`) tetap tampil. Yang berubah: prestasi **baru** yang punya
  foto dan tanggal sebaiknya ditulis sebagai event berkategori "Prestasi". Section
  Prestasi lama jadi ringkasan pencapaian yang tidak lekang waktu (akreditasi, juara
  bertahan), bukan tempat mencatat kejadian

Menggabungkan ketiganya menjadi satu tabel adalah pekerjaan migrasi data yang berisiko dan
tidak diminta siapa pun. Kalau nanti terbukti membingungkan admin, penggabungan itu
ditulis sebagai PRD tersendiri.

---

## 5. Daftar Fitur

### F1 — Sumber & tahun ajaran pada pendaftaran

- Kolom `source` dan `academic_year` ditambahkan ke `ppdb_registrations` (7.1)
- `insertWithin()` di `modules/registration/repository.ts` menerima keduanya. Ini satu-satunya
  tempat baris pendaftaran dibuat, dipakai bersama oleh jalur online (settle DOKU) dan jalur
  manual, jadi tidak ada jalur yang bisa lolos tanpa menandai sumbernya
- `POST /api/registrations` (butuh login admin) → `source = 'offline'`
- Jalur pendaftaran publik → `source = 'online'`
- `academic_year` diisi dari baris `registration_stats` yang `is_current`. Kalau tidak ada
  baris aktif, pendaftaran **tetap tersimpan** dengan `academic_year` kosong — pendaftaran
  orang tidak boleh gagal gara-gara admin belum mengisi pengaturan
- Baris lama di-backfill: `source = 'online'` **hanya** untuk yang punya baris pembayaran
  `source = 'online'`; sisanya `'offline'`. Pembayaran `'manual'` jelas offline, dan baris
  tanpa pembayaran sama sekali juga offline: sebelum 2026-09-05 (commit `73aaf23`) input
  manual admin tidak membuat baris pembayaran, sedangkan sejak DOKU aktif (2026-08-25)
  pendaftaran online selalu lahir dari pembayaran sukses. Saat migrasi dijalankan,
  produksi belum punya satu pun baris pendaftaran — backfill ini hanya benar-benar
  bekerja di staging

**Selesai jika:** pendaftaran baru lewat website tersimpan sebagai `online`, lewat form
admin sebagai `offline`, dan semua baris lama punya nilai yang masuk akal.

### F2 — Halaman Statistik (admin)

Halaman baru `/admin/statistics`, menu **"Statistik"** di grup **"Masuk"** pada sidebar
(bersebelahan dengan Pendaftar). Bisa diakses `admin` maupun `superadmin` — ini pekerjaan
tata usaha, bukan pengaturan uang.

Halaman ini menampung **semua angka yang tampil sebagai statistik di landing page**, dibagi
dua bagian.

#### Bagian 1 — Angka sekolah

> Sejak 16 Nov 2026 bagian ini hanya menampilkan angka dari SSO (3.3). Isian di bawah adalah
> rancangan awal.

- Dua kolom isian: **Siswa aktif** dan **Guru & staf**, keduanya bilangan bulat ≥ 0
- Disimpan ke `school_profiles` (3.3, 7.4) lewat route API-nya sendiri, bukan menumpang
  form Profil Sekolah
- Ditaruh paling atas karena inilah yang paling sering disentuh. Menyimpan cukup satu
  tombol, tanpa mengisi ulang apa pun
- Keterangan kecil di bawahnya: _"Angka ini tampil di halaman depan."_ — supaya admin tahu
  ketikannya langsung dilihat publik

#### Bagian 2 — Pendaftar

- Pemilih tahun ajaran + tombol menambah tahun ajaran baru dan menandai mana yang aktif
- Ringkasan tahun ajaran terpilih:

  | Baris                               | Sumber                                      |
  | ----------------------------------- | ------------------------------------------- |
  | Pendaftar online                    | Hitungan database, hanya baca               |
  | Pendaftar offline sudah diinput     | Hitungan database (`source = 'offline'`)    |
  | **Pendaftar offline belum diinput** | **Kolom isian** — satu-satunya yang diketik |
  | Total tampil di website             | Jumlah ketiganya                            |

- Label kolom isian ditulis tegas: **"Pendaftar offline yang belum diinput ke sistem"**,
  dengan keterangan di bawahnya: _"Sudah ada N pendaftar offline yang diinput lewat form.
  Jangan dihitung lagi di sini."_ Ini penjaga utama terhadap hitung ganda dari sisi
  manusia; penjaga dari sisi data sudah dipasang di F1
- Angka total ditampilkan hidup begitu isian diubah, sebelum disimpan — supaya admin
  melihat akibat ketikannya sebelum menekan simpan
- Menyimpan bagian mana pun memanggil `revalidatePath("/")` agar landing page ikut segar

**Selesai jika:** admin mengganti jumlah siswa aktif dan angka pendaftar offline,
menyimpan, lalu melihat keduanya berubah di landing page tanpa perlu deploy.

### F3 — Angka hero di landing page

Deretan angka hero (`HeroStats`) berubah dari lima nilai hardcode menjadi campuran:

| Butir          | Sumber                                                            |
| -------------- | ----------------------------------------------------------------- |
| Siswa aktif    | `school_profiles.active_student_count`                            |
| Guru & staf    | `school_profiles.staff_count`                                     |
| Pendaftar TA … | Hitungan pendaftar + angka offline manual, label ikut tahun aktif |
| Tahun berdiri  | Tetap konstanta di `Hero.tsx`                                     |
| Akreditasi     | Tetap konstanta di `Hero.tsx`                                     |

- Nilai dinamis diambil di server — `Hero` sudah `async` dan sudah memanggil
  `getSchoolProfile()`, jadi dua angka sekolah ikut tanpa query tambahan. Angka pendaftar
  lewat server action baru `lib/actions/registrationStats.ts`
- Kegagalan mengambil data **tidak** menjatuhkan halaman: polanya sama seperti
  `lib/actions/activities.ts` — catat error, kembalikan nilai kosong
- Butir yang nilainya kosong atau 0 **tidak dirender sama sekali**, bukan tampil "0". Ini
  berlaku untuk ketiganya: "0 Siswa aktif" di halaman sekolah lebih merusak daripada satu
  angka yang hilang
- Angka pendaftar juga disembunyikan kalau tidak ada tahun ajaran aktif (4.2)
- Susunan grid `HeroStats` sudah menangani jumlah butir yang berubah-ubah (dua kolom di
  layar kecil, sebaris penuh saat muat), jadi komponennya tidak perlu diubah selain
  menerima data dari luar
- Animasi hitung naik yang sudah ada tetap dipakai apa adanya

**Selesai jika:** kelima angka tampil benar, tiga di antaranya berasal dari database, dan
halaman tetap rapi saat salah satunya kosong.

### F4 — Modul event (admin)

CRUD di `/admin/events`, menu **"Event"** di grup **"Konten Halaman"**, mengikuti pola
`/admin/activity` yang sudah ada — daftar kartu, dialog form, unggah foto, hapus dengan
konfirmasi.

- Form: judul, kategori (dengan saran kategori yang pernah dipakai), tanggal peristiwa,
  ringkasan, isi, poster, dan sakelar **Terbitkan**
- Poster diunggah ke bucket baru `event-photos`; `event-photos` ditambahkan ke
  `ALLOWED_BUCKETS` di `app/api/storage/upload/route.ts`
- Mengganti poster menghapus berkas lama lewat `removeStoragePhoto()`, seperti fitur lain
- Daftar diurutkan `event_date` menurun, draf ditandai jelas dan tampil paling atas
- Setiap perubahan memanggil `revalidatePath("/")` dan `revalidatePath("/event")`
- Menghapus event yang sudah terbit meminta konfirmasi yang menyebut bahwa tautannya akan
  mati

**Selesai jika:** admin membuat event bertanggal lengkap dengan poster, menyimpannya
sebagai draf, lalu menerbitkannya.

### F5 — Halaman publik Event

**`/event` — daftar**

- Grid kartu poster portrait, urut `event_date` menurun, hanya yang `is_published`
- Penyaring kategori berupa deretan chip, diambil dari kategori yang benar-benar ada
- Hanya event terbit yang pernah dikirim ke klien — draf disaring di query, bukan di
  komponen
- `revalidate = 300`, sama dengan landing page
- Keadaan kosong ditangani: kalau belum ada event sama sekali, halaman tetap tampil rapi
  dengan ajakan melihat kegiatan sekolah

**`/event/[slug]` — detail**

- Poster tampil penuh tanpa dipotong, lalu judul, kategori, tanggal, dan isi
- Tombol **Bagikan ke WhatsApp** yang membuka `wa.me` berisi judul + URL event
- `generateMetadata` per event: judul, deskripsi dari `summary`, dan gambar OG dari
  poster. Inilah yang membuat link tampil sebagai kartu bergambar saat ditempel ke WA
- JSON-LD `@type: Event` di halaman detail
- Slug tak dikenal → `notFound()`

**Navigasi**

- Navbar menambah entri **"Event"** ke `/event`
- Karena Navbar kini dipakai di halaman selain landing, anchor-nya harus ditulis
  `/#tentang`, bukan `#tentang` — kalau tidak, menekan "Tentang" dari `/event` tidak
  membawa pengunjung ke mana-mana
- `sitemap.ts` menambahkan `/event` dan seluruh URL event terbit. Komentar "situs ini satu
  halaman" di berkas itu ikut diperbarui

**Selesai jika:** URL satu event ditempel ke WhatsApp dan muncul sebagai kartu bergambar
poster, dan mengkliknya membuka halaman event itu.

**Catatan implementasi (M6, branch `feat/event-public-pages`)** — keputusan yang diambil saat
membangun F5 dan tidak tertulis di atas:

| Hal                        | Yang diimplementasikan                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Query publik               | `repository.listPublished()` dan `findPublishedBySlug()` — `WHERE is_published = true` di SQL. Server action di `lib/actions/events.ts`                                                                                                                                                                                                                                                                                              |
| Format `event_date`        | `postgres.js` mengubah kolom `date` jadi objek `Date` walau tipenya ditulis `string`. Query publik memakai `event_date::text` supaya dapat `YYYY-MM-DD` bersih (untuk JSON-LD dan format tanggal). Query admin M5 tidak diubah                                                                                                                                                                                                       |
| Gagal DB di halaman detail | `getPublishedEvent()` **melempar ulang** error, bukan mengembalikan `null` — `null` berarti 404 dan 404 ikut ter-cache ISR. Daftar `/event` tetap mengikuti pola kembalikan `[]`                                                                                                                                                                                                                                                     |
| Cache `/event/[slug]`      | `generateStaticParams()` mengembalikan `[]`: build tidak menyentuh DB, tiap event di-cache ISR saat pertama dibuka (`revalidate = 300`)                                                                                                                                                                                                                                                                                              |
| Revalidate dari admin      | Route `POST/PUT/DELETE /api/events` memanggil `revalidatePath("/event", "layout")`, bukan `revalidatePath("/event")` — supaya halaman detail event yang dijadikan draf atau dihapus ikut segar, tidak tertinggal di cache                                                                                                                                                                                                            |
| Footer                     | Footer juga tampil di `/event`, jadi anchor-nya ikut ditulis `/#tentang` dst. dan mendapat tautan "Event" — sama seperti Navbar                                                                                                                                                                                                                                                                                                      |
| Logo Navbar                | `href="/#"`, bukan `/`: di landing tetap hanya menggulir ke atas tanpa memuat ulang, dari `/event` membawa pulang ke landing. Jarak menu desktop jadi `gap-5` di `lg` (`xl:gap-7`) supaya enam tautan + tombol muat di 1024 px                                                                                                                                                                                                       |
| Kartu event                | `components/sections/EventCard.tsx` (dipakai ulang M7). Kelas ditulis sebagai `cva` (6.4) dan diekspor untuk dipakai halaman detail: `categoryBadgeVariants` + `categoryTone()`, `posterFrameVariants`, `posterImageVariants`, `posterFallbackVariants`. Tanggal diformat `formatDateOnly()` di `lib/date.ts`. Wadah `aspect-3/4` + `object-contain` — di kartu pun poster tidak di-crop agar tulisannya terbaca di HP (skenario 15) |
| Warna kategori             | PMB/PPDB hijau brand, Prestasi hijau tua, Akram hitam, HUT RI/17 Agustus merah; sisanya warna aksen                                                                                                                                                                                                                                                                                                                                  |
| Chip penyaring             | Disaring di klien (semua data yang dikirim memang event terbit). Chip hanya tampil kalau ada **≥ 2** kategori berbeda                                                                                                                                                                                                                                                                                                                |
| `og:image` dan WebP        | `og:image` memakai `poster_url` apa adanya. Poster diunggah lewat `lib/image.ts` yang **mengubah semua gambar jadi WebP** — belum pasti WhatsApp menampilkan WebP sebagai kartu. Diuji pertama kali lewat skenario 12 di staging; kalau gagal, solusinya (misal salinan JPEG khusus OG) dibahas terpisah karena mengubah alur unggah M5                                                                                              |
| JSON-LD                    | `@type: Event` dengan `startDate`, `image`, `location` (alamat dari `school_profiles`), `organizer`. Karakter `<` di-escape karena isinya diketik admin                                                                                                                                                                                                                                                                              |
| Gaya kelas di halaman      | `app/event/page.tsx`, `app/event/[slug]/page.tsx`, dan `EventList.tsx` juga menaruh kelas panjang sebagai konstanta `cva` di atas berkas (`chipVariants({ active })`, `shareButtonVariants`, dst.). Yang tetap inline hanya kelas yang sangat pendek. **Bukan** shadcn `Badge`/`Card` — halaman publik repo ini memakai Tailwind + palet `brand`/`ink`/`accent`; shadcn hanya untuk perilaku (Dialog, Select, Popover)               |
| Tertunda ke M7             | Komentar di `app/page.tsx` (`generateMetadata`, bagian `alternates`) masih berbunyi "halaman ini satu-satunya halaman publik" — sudah tidak benar sejak `/event` ada. Dirapikan saat M7 menyentuh berkas itu                                                                                                                                                                                                                         |

### F6 — Teaser event di landing page

- Section baru setelah section Kegiatan: **"Event Terbaru"**, berisi **3 event terbit
  terbaru** dalam kartu poster portrait
- Tombol **"Lihat semua event"** ke `/event`
- Kalau belum ada event terbit, seluruh section **tidak dirender** — bukan tampil kosong
- Mengikuti pola reveal-on-scroll yang sudah dipakai section lain

**Selesai jika:** landing page menampilkan 3 event terbaru, dan section itu hilang sendiri
saat semua event dijadikan draf.

**Catatan implementasi (M7, branch `feat/event-landing-teaser`)** — keputusan yang diambil
saat membangun F6 dan tidak tertulis di atas:

| Hal                       | Yang diimplementasikan                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Query 3 event terbaru     | `repository.listLatestPublished(limit)` — query terpisah dari `listPublished()` dengan `LIMIT`, bukan memotong hasil `listPublished()` di kode. Memotong di kode berarti menarik seluruh arsip event dari database di setiap render landing, padahal arsipnya terus bertambah tiap tahun                                                                                                |
| Tata letak di HP (390 px) | **Opsi A** yang disepakati sebelum eksekusi: di lebar dasar kartu digulir menyamping di dalam wadahnya sendiri (kartu selebar 75% wadah, kartu berikutnya sengaja terlihat sebagian sebagai isyarat), `sm:` ke atas berubah jadi grid 3 kolom tanpa gulir. Menumpuk ke bawah di HP (opsi B) ditolak karena tiga poster portrait berturutan membuat section ini ±1.800 px dan melawan G8 |
| Komponen                  | `components/sections/EventTeaser.tsx`, server component. Memakai ulang `EventCard` dari M6 apa adanya — tidak ada varian baru di `EventCard`                                                                                                                                                                                                                                            |
| Reveal                    | Tiap kartu punya `delay` sendiri (`index * 80` ms) mengikuti pola _Reveal_ section lain, supaya kartu menyusul satu per satu, bukan muncul serentak                                                                                                                                                                                                                                     |
| Komentar `app/page.tsx`   | Komentar `alternates.canonical` yang masih berbunyi "halaman ini satu-satunya halaman publik" (tertunda sejak M6) dirapikan di tahap ini karena berkasnya sudah disentuh untuk memasang `<EventTeaser />`                                                                                                                                                                               |

---

## 6. Konvensi yang Diikuti

Semua yang dibangun mengikuti pola yang sudah berjalan di repo ini. Tidak ada pola baru
yang diperkenalkan.

### 6.1 Layering backend

```
modules/<domain>/
  entity.ts      tipe domain + tipe input
  dto.ts         skema zod request + tipe response
  repository.ts  SQL. Satu-satunya tempat SQL ditulis
  service.ts     aturan bisnis, dibungkus withDbLogging()
```

- Route (`app/api/**/route.ts`) hanya: `requireUser()` → parse zod → panggil service →
  `revalidatePath()` → balas. Tanpa SQL, tanpa aturan bisnis
- Kegagalan dicatat `console.error` dengan awalan nama route, lalu dibalas pesan Indonesia
  yang aman dibaca pengguna

### 6.2 Pengambilan data

| Konsumen        | Caranya                                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------------------------- |
| Halaman publik  | Server action di `lib/actions/*.ts` — memanggil service langsung, `try/catch`, kembalikan nilai kosong saat gagal |
| Dashboard admin | Klien fetch di `lib/api/*.ts` → route API                                                                         |

### 6.3 Migrasi

- Satu berkas per perubahan, `web/modules/db/migrations/YYYYMMDD_deskripsi.sql`
- Dibungkus `BEGIN; … COMMIT;`
- Diawali komentar `-- Migration: …` yang menjelaskan **kenapa**, bukan mengulang isi SQL
- Rollback ditulis sebagai komentar di bagian bawah berkas
- Aturan yang bisa dijaga database dijaga di database (CHECK, unique index), bukan hanya
  di aplikasi
- **Dijalankan otomatis saat deploy.** `pmb-deploy` menjalankan `scripts/migrate.mjs` dengan
  image baru sebelum container lama diganti (production dicadangkan dulu). Hanya berkas yang
  belum tercatat di `schema_migrations` yang dijalankan. Kalau migrasi gagal, deploy berhenti
  dan versi lama tetap melayani
- **Harus aman untuk kode lama.** Selama migrasi berjalan, container lama masih melayani
  pengunjung. Jadi migrasi cukup menambah (tabel, kolom nullable, index). Menghapus atau
  mengganti nama dikerjakan di rilis berikutnya, setelah kode yang memakainya sudah hilang
- `ALTER TABLE` pada tabel yang sedang dipakai: tambahkan `SET lock_timeout = '10s';` tepat
  setelah `BEGIN;`, supaya deploy gagal cepat alih-alih menggantung menunggu lock
- Rollback image tidak memundurkan migrasi — image lama tetap memakai skema baru. Kalau
  skema harus dikembalikan, minta infra memulihkan dari dump
  `/var/backups/darussalam/pre-migration/` (5 terakhir disimpan)

### 6.4 Frontend

- Tailwind + `cva` untuk varian kelas; `cn()` untuk penggabungan
- Komponen dialog dari `components/ui/dialog` (Base UI)
- `components/admin/` tidak berisi berkas di root-nya: komponen fitur di folder fiturnya
  (`payment/`, `statistics/`, `registrations/`, …), kerangka dashboard di `layout/`, dan
  komponen yang dipakai banyak halaman di `shared/`
- Komentar kode dalam Bahasa Indonesia, menjelaskan alasan, ditulis pendek
- **Satu pelajaran yang wajib dipatuhi:** jangan mereset state yang menyusun `href` sebuah
  anchor di dalam `onClick` anchor itu sendiri. React mem-flush pembaruan state sebelum
  browser menjalankan navigasi, jadi `href` keburu berubah dan tautannya batal. Ini pernah
  terjadi di dialog "Hubungi Orang Tua" pada `/admin/registrations`. Kalau dialog memang
  harus tertutup setelah tautan dibuka, tutup di tick berikutnya

### 6.5 Mobile first — mengikat untuk semua halaman publik

Hampir seluruh pengunjung situs ini datang dari HP, lewat tautan yang dikirim di
WhatsApp. Halaman event akan paling sering dibuka justru dari status WA — sambil berdiri,
satu tangan. Jadi tampilan HP bukan penyesuaian yang dikerjakan belakangan, melainkan
titik berangkatnya.

Aturannya:

- **Rancang di lebar 390 px dulu**, baru lebarkan. Tulis kelas dasar untuk HP, lalu
  tambahkan `sm:` / `lg:` untuk layar besar — jangan sebaliknya
- **Tidak boleh ada scroll horizontal** di lebar berapa pun. Judul panjang dipotong
  (`truncate`) atau dipatahkan (`wrap-break-word`), tidak mendorong layout
- **Poster portrait harus terbaca utuh di HP**, tidak terpotong di bagian yang ada
  tulisannya — di halaman detail poster tampil penuh, bukan di-crop
- **Target sentuh minimal 44 px** untuk tombol dan tautan, termasuk chip penyaring
  kategori dan tombol bagikan
- **Gambar tidak menggeser layout saat dimuat** — beri rasio aspek tetap pada wadahnya
- Bagian yang menggulir menyamping (deretan chip kategori, teaser event di landing)
  menggulir **di dalam wadahnya sendiri**, bukan menyeret seluruh halaman
- **Diperiksa di lebar 390 px sebagai syarat selesai**, bukan sebagai catatan tambahan —
  lihat skenario 15 dan 21 di Bagian 9

Pola ini sudah dipakai komponen yang ada (`ActivityContent.tsx` menaruh keterangan selalu
terlihat di layar sentuh dan baru mengikuti hover mulai `lg:`). Ikuti, jangan buat pola
baru.

### 6.6 Guide for Clean Code

Kode PMB mengikuti **GUIDE FOR CLEAN CODE** milik pemilik repo, yang juga dipakai LMS.
Isinya berlaku apa adanya (500 baris per berkas, nesting maksimal 2, parameter maksimal 3,
argumen lewat variabel, objek 3+ field satu per baris, hindari N+1, jangan pecah fungsi
sebelum batas terlewati, logika bisnis di backend, aturan Frontend React). Penyesuaian
istilah untuk Next.js + TypeScript:

| Di guide                                          | Di PMB                                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Backend (Go)                                      | `modules/<domain>/` (service, repository) dan `app/api/**/route.ts`                                      |
| Fungsi Go maksimal 100 baris                      | Fungsi di `modules/`, handler route, dan server action maksimal 100 baris                                |
| Pengecualian parameter: `ctx`, konstruktor `New…` | Bentuk yang ditentukan Next.js: handler route, server action, `generateMetadata`, props halaman          |
| Struct domain / struct DTO                        | `entity.ts` (dipakai service & repository) / `dto.ts` (skema zod dan bentuk request/response)            |
| Tiap tabel satu fitur pemilik                     | Sama: hanya `modules/<pemilik>/repository.ts` yang menulis query ke tabelnya, termasuk JOIN dan subquery |
| HANDOVER.md maksimal 150 baris                    | Tidak dipakai — PMB belum punya HANDOVER                                                                 |

**Pemilik tabel:**

| Fitur (`modules/…`)                              | Tabel                                                                                                        |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `auth`                                           | `admin_users`, `refresh_tokens`, `login_attempts`                                                            |
| `admin`                                          | `admin_action_tokens` — memanggil service `auth` untuk akun & sesi, tidak sebaliknya                         |
| `registration`                                   | `ppdb_registrations`, `ppdb_registration_details`, `ppdb_registration_parents`, `ppdb_registration_students` |
| `payment`                                        | `registration_payments`, `doku_notification_events`                                                          |
| `payment-settings`                               | `payment_settings`                                                                                           |
| `registration-stats`                             | `registration_stats`                                                                                         |
| `school-profile`                                 | `school_profiles`                                                                                            |
| `analytics`                                      | `site_visits`                                                                                                |
| `event`                                          | `events`                                                                                                     |
| `activity`, `achievement`, `facility`, `program` | tabel senamanya (`activities`, `achievements`, `facilities`, `programs`)                                     |

Tabel `registrations` (bentuk pendaftaran lama, kosong) tidak dipakai kode mana pun.

**Kapan diterapkan:** hanya pada berkas yang disentuh, baik karena kodenya diubah maupun
kode baru ditambahkan. Berkas yang tidak disentuh dibiarkan dulu, supaya satu perubahan
kecil tidak menyeret perapian besar. **Perubahan mekanis tidak dihitung menyentuh**: mengganti
teks path, mengganti nama import, atau memindah folder. Berkasnya dirapikan saat logikanya
benar-benar diubah.

Pelanggaran lama yang tercatat per 11 November 2026:

- Berkas lebih dari 500 baris: `RegistrationForm.tsx` (1164), `(admin)/(dashboard)/registrations/page.tsx`
  (910), `(admin)/(dashboard)/about/page.tsx` (698), `modules/registration/repository.ts` (574),
  `(admin)/(dashboard)/transactions/page.tsx` (559)
- Komponen lebih dari 200 baris: `(admin)/(dashboard)/dashboard/page.tsx` (429).
  `components/admin/layout/AdminSidebar.tsx` sudah dirapikan di PR 1 (17 Nov 2026)
- Tabel `registration_payments` di-query oleh repository `payment` dan `registration`

### 6.7 Alamat halaman admin

Halaman admin tidak memakai awalan `/admin` (folder `app/(admin)/` adalah route group, jadi
tidak muncul di URL): `/masuk-sekolah` untuk login, `/dashboard` untuk beranda, lalu
`/registrations`, `/event-management`, `/admin-management`, dan seterusnya. Pengunjung yang
belum login mendapat **404**, bukan dialihkan ke halaman login — dari luar, halaman admin
tidak bisa dibedakan dari halaman yang tidak ada. Alamat admin tidak ditulis di
`robots.txt`; penanda `noindex` dipasang di `app/(admin)/layout.tsx`.

Halaman publik baru tidak boleh memakai nama yang sudah dipakai admin.

---

## 7. Skema Database

### 7.1 `20260911_add_source_and_academic_year_to_ppdb_registrations.sql`

```sql
BEGIN;

-- Migration: tandai kanal pendaftaran dan tahun ajarannya.
--
-- Pendaftar offline yang diinput admin lewat form manual sebelumnya tidak bisa
-- dibedakan dari pendaftar online. Tanpa pembeda itu, angka offline yang diketik
-- admin di dashboard berisiko menghitung ulang orang yang sudah ada barisnya.
--
-- academic_year disimpan, bukan disimpulkan dari created_at, supaya angka tahun
-- lalu tetap sama meski jendela pendaftaran diubah.
--
-- DEFAULT 'online' sengaja dipertahankan: kode lama yang masih jalan di sela
-- migrasi dan deploy tetap bisa menyimpan pendaftaran, bukan gagal.
ALTER TABLE ppdb_registrations
    ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'online',
    ADD COLUMN IF NOT EXISTS academic_year text;

ALTER TABLE ppdb_registrations
    DROP CONSTRAINT IF EXISTS ppdb_registrations_source_check;

ALTER TABLE ppdb_registrations
    ADD CONSTRAINT ppdb_registrations_source_check
    CHECK (source IN ('online', 'offline'));

ALTER TABLE ppdb_registrations
    DROP CONSTRAINT IF EXISTS ppdb_registrations_academic_year_format;

ALTER TABLE ppdb_registrations
    ADD CONSTRAINT ppdb_registrations_academic_year_format
    CHECK (academic_year IS NULL OR academic_year ~ '^[0-9]{4}/[0-9]{4}$');

-- Baris lama: online hanya kalau lahir dari pembayaran DOKU. Input manual admin
-- sebelum 2026-09-05 tidak membuat baris pembayaran sama sekali, jadi baris
-- tanpa pembayaran online juga offline.
UPDATE ppdb_registrations pr
SET source = 'offline'
WHERE NOT EXISTS (
    SELECT 1
    FROM registration_payments rp
    WHERE rp.registration_id = pr.id
      AND rp.source = 'online'
);

-- Semua baris yang sudah ada masuk tahun ajaran yang sedang dibuka pendaftarannya.
UPDATE ppdb_registrations
SET academic_year = '2027/2028'
WHERE academic_year IS NULL;

CREATE INDEX IF NOT EXISTS ppdb_registrations_stats_idx
    ON ppdb_registrations (academic_year, source);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP INDEX IF EXISTS ppdb_registrations_stats_idx;
-- ALTER TABLE ppdb_registrations
--     DROP CONSTRAINT IF EXISTS ppdb_registrations_academic_year_format,
--     DROP CONSTRAINT IF EXISTS ppdb_registrations_source_check,
--     DROP COLUMN IF EXISTS academic_year,
--     DROP COLUMN IF EXISTS source;
-- COMMIT;
```

### 7.2 `20260911_create_registration_stats.sql`

```sql
BEGIN;

-- Migration: create table registration_stats
-- Menyimpan jumlah pendaftar offline yang belum diinput satu per satu ke sistem,
-- satu baris per tahun ajaran. Angka online tidak disimpan di sini — ia selalu
-- dihitung dari ppdb_registrations supaya tidak pernah basi.
--
-- is_current menandai tahun ajaran yang angkanya tampil di landing page. Hanya
-- boleh ada satu, dan itu dijaga index di bawah: dua tahun aktif membuat angka
-- publik salah tanpa memunculkan error apa pun.
CREATE TABLE IF NOT EXISTS registration_stats (
    -- CASE, bukan AND: Postgres tidak menjamin urutan AND, dan cast ::int pada
    -- teks yang formatnya salah akan error sebelum CHECK sempat menolaknya.
    academic_year text PRIMARY KEY
        CHECK (
            CASE
                WHEN academic_year ~ '^[0-9]{4}/[0-9]{4}$'
                THEN split_part(academic_year, '/', 2)::int
                     = split_part(academic_year, '/', 1)::int + 1
                ELSE false
            END
        ),

    offline_count integer NOT NULL DEFAULT 0
        CHECK (offline_count >= 0),

    is_current boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS registration_stats_one_current_idx
    ON registration_stats (is_current)
    WHERE is_current;

-- Tahun ajaran yang sedang dibuka pendaftarannya, sama dengan label di hero.
INSERT INTO registration_stats (academic_year, offline_count, is_current)
VALUES ('2027/2028', 0, true)
ON CONFLICT (academic_year) DO NOTHING;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS registration_stats;
-- COMMIT;
```

### 7.3 `20260912_create_events.sql`

```sql
BEGIN;

-- Migration: create table events
-- Rumah tetap untuk poster kegiatan yang selama ini hanya disebar lewat status
-- WhatsApp dan hilang dalam 24 jam.
--
-- slug dipakai di URL publik dan sengaja terpisah dari title: begitu tautannya
-- tersebar, mengubah judul tidak boleh mematikan tautan yang sudah dikirim.
--
-- category dibiarkan teks bebas, mengikuti activities.badge — sekolah membuat
-- jenis kegiatan baru tiap tahun, dan daftar tertutup berarti setiap kegiatan
-- baru menunggu migrasi.
CREATE TABLE IF NOT EXISTS events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    slug text NOT NULL UNIQUE
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

    title text NOT NULL,
    category text NOT NULL DEFAULT '',
    summary text NOT NULL DEFAULT '',
    body text NOT NULL DEFAULT '',

    poster_url text,

    -- Tanggal peristiwa, bukan tanggal input. Ini yang menentukan urutan tampil.
    event_date date NOT NULL,

    is_published boolean NOT NULL DEFAULT false,
    published_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_published_idx
    ON events (is_published, event_date DESC);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS events;
-- COMMIT;
```

### 7.4 `20260912_add_stat_counts_to_school_profiles.sql`

```sql
BEGIN;

-- Migration: jumlah siswa aktif dan guru/staf jadi data, bukan konstanta.
--
-- Dua angka ini tampil di hero dan sebelumnya hardcode di Hero.tsx. Jumlah siswa
-- berubah nyaris tiap hari, jadi menaruhnya di kode berarti setiap koreksi
-- menunggu deploy. Tiga angka hero lain sengaja dibiarkan di kode karena
-- berubah bertahun sekali.
--
-- Ditaruh di school_profiles supaya hero tidak perlu query tambahan: halaman itu
-- sudah memuat baris ini untuk foto dan video.
--
-- NULL berarti belum diisi, dan butir statistiknya tidak dirender. Itu berbeda
-- dari 0, yang berarti "benar-benar tidak ada" — dan tidak pernah benar untuk
-- sekolah yang sedang berjalan.
ALTER TABLE school_profiles
    ADD COLUMN IF NOT EXISTS active_student_count integer
        CHECK (active_student_count IS NULL OR active_student_count >= 0),
    ADD COLUMN IF NOT EXISTS staff_count integer
        CHECK (staff_count IS NULL OR staff_count >= 0);

-- Angka yang sedang tampil di Hero.tsx saat migrasi ini ditulis, supaya tampilan
-- tidak berubah sampai admin memperbaruinya sendiri.
UPDATE school_profiles
SET active_student_count = COALESCE(active_student_count, 683),
    staff_count = COALESCE(staff_count, 65);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE school_profiles
--     DROP COLUMN IF EXISTS staff_count,
--     DROP COLUMN IF EXISTS active_student_count;
-- COMMIT;
```

### 7.5 `20260912_enable_rls_on_events.sql` & `20260912_grant_privileges_on_events.sql`

Mengikuti persis pola `20260811_enable_rls_on_achievements.sql` dan pasangan `grant`-nya.

Tabel `registration_stats` mendapat pasangan serupa, tapi dikerjakan di **M1** bersama
pembuatan tabelnya supaya tabel itu tidak sempat terbuka tanpa RLS sampai M5
(`20260911_enable_rls_on_registration_stats.sql` + `20260911_grant_privileges_on_registration_stats.sql`).
Polanya mengikuti `payment_settings`, bukan `achievements`: tanpa akses `anon` karena angka
publik dihitung di server, dan tanpa `DELETE` supaya angka tahun lalu tidak bisa hilang.

### 7.6 `20260912_create_event_photos_bucket.sql`

Mengikuti `20260804_create_activity_photos_bucket.sql`, dengan `event-photos` sebagai id
bucket dan empat policy yang sama (publik boleh melihat, `authenticated` boleh
unggah/ubah/hapus).

---

## 8. Tahapan Pengerjaan

Kerjakan **satu M sampai tuntas, lalu berhenti**. Setiap M ditulis supaya bisa dimulai
dari context kosong dengan bekal dokumen ini.

Kolom **Model** adalah saran agent yang dipakai, dipilih dari **beratnya risiko dan
logika — bukan dari banyaknya baris kode**. Tahap yang sekadar mengikuti pola yang sudah
ada di repo cukup SONNET; tahap yang bisa merusak data produksi atau menuntut banyak
keputusan desain dipegang OPUS.

| Tahap | Model    | Isi                                                                                                                                                                                                                                                                                                                                                              | Hasil yang bisa dilihat                                                                                                                  |
| ----- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| M1    | **OPUS** | F1 — migrasi 7.1 **dan 7.2** (F1 membaca tahun ajaran aktif dari `registration_stats`, jadi tabelnya harus ada lebih dulu) beserta RLS + grant `registration_stats` (7.5), `insertWithin()` menerima `source` + `academic_year`, kedua jalur pendaftaran mengisinya, backfill. Pembacaan tahun aktif cukup satu fungsi repository kecil — modul lengkapnya di M2 | Daftar pendaftar di admin tetap normal; kolom baru terisi benar untuk data lama; pendaftaran baru mendapat `academic_year = '2027/2028'` |
| M2    | SONNET   | Migrasi 7.4, modul `registration-stats` lengkap (entity/dto/repository/service) + route API + kolom baru masuk modul `school-profile`                                                                                                                                                                                                                            | `GET/PUT /api/registration-stats` dan penyimpanan dua angka sekolah jalan lewat Postman                                                  |
| M3    | SONNET   | F2 — halaman `/admin/statistics` (dua bagian) + entri sidebar                                                                                                                                                                                                                                                                                                    | Admin mengubah jumlah siswa dan angka offline, keduanya tersimpan                                                                        |
| M4    | SONNET   | F3 — server action + kelima angka hero                                                                                                                                                                                                                                                                                                                           | Landing page menampilkan siswa aktif, guru & staf, dan pendaftar dari database                                                           |
| M5    | SONNET   | Migrasi 7.3, 7.5, 7.6 + modul `event` + F4 (`/admin/events`)                                                                                                                                                                                                                                                                                                     | Admin membuat, menyunting, menerbitkan, dan menghapus event berikut posternya                                                            |
| M6    | **OPUS** | F5 — `/event`, `/event/[slug]`, navbar, sitemap, metadata OG, JSON-LD                                                                                                                                                                                                                                                                                            | Link event ditempel ke WA dan muncul sebagai kartu bergambar                                                                             |
| M7    | SONNET   | F6 — teaser di landing page                                                                                                                                                                                                                                                                                                                                      | Tiga event terbaru tampil di landing, section hilang saat kosong                                                                         |

**PRD tercapai ketika M1–M7 selesai** dan seluruh skenario Bagian 9 berhasil.

### 8.1 Kenapa pembagiannya begitu

**M1 — OPUS.** Satu-satunya tahap yang menyentuh **jalur pembayaran**. `insertWithin()`
dipanggil di dalam transaksi penyelesaian pembayaran DOKU; kalau signature-nya berubah
dan satu pemanggil terlewat, pendaftar yang sudah membayar bisa gagal tercatat — uangnya
masuk, datanya tidak. Migrasinya juga menjalankan `UPDATE` backfill di atas data
pendaftar sungguhan, dan salah tebak kolom di sana tidak bisa dibatalkan dengan
`git revert`. Ongkos kesalahannya paling mahal di seluruh PRD.

**M6 — OPUS.** Tahap dengan keputusan terbanyak dan paling banyak menyentuh bagian yang
sudah jalan: halaman publik baru yang harus mobile first (6.5), metadata OG yang
menentukan tampilan link di WhatsApp, JSON-LD, sitemap, dan **perubahan Navbar** yang
dipakai landing page — anchor `#tentang` jadi `/#tentang`. Salah di Navbar berarti menu
landing page yang sekarang berfungsi ikut rusak. Ini juga halaman yang paling banyak
dilihat orang dari seluruh fitur ini.

**Sisanya — SONNET**, karena masing-masing punya contoh yang tinggal diikuti di repo:

| Tahap | Contoh yang diikuti                                                                                                                        | Satu hal yang tetap perlu diperhatikan                                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M2    | `modules/payment-settings` untuk bentuk modul, `20260906_add_registration_window_to_payment_settings.sql` untuk gaya migrasi `ALTER TABLE` | Memindahkan tahun ajaran aktif = mematikan yang lama **dan** menyalakan yang baru dalam **satu transaksi**, kalau tidak partial unique index menolaknya |
| M3    | `/admin/payment` untuk halaman pengaturan berbentuk form                                                                                   | Label kolom offline dan keterangan "sudah ada N yang diinput" wajib persis seperti F2 — itu penjaga hitung ganda                                        |
| M4    | `lib/actions/activities.ts` untuk server action yang tidak menjatuhkan halaman                                                             | Butir bernilai kosong/0 tidak dirender, bukan tampil "0"                                                                                                |
| M5    | `/admin/activity` + `modules/activity` untuk CRUD, unggah, dan hapus foto                                                                  | Aturan slug 4.4: dibuat saat pertama terbit, lalu **dikunci** — uji dengan menyunting judul event yang sudah terbit                                     |
| M7    | Komponen kartu event dari M6 (`EventCard.tsx`, lihat catatan implementasi F5), pola reveal dari section lain                               | Section tidak dirender sama sekali saat belum ada event terbit                                                                                          |

**Kalau SONNET tersangkut di satu tahap**, naikkan tahap itu ke OPUS — jangan
memaksakan. Tanda-tandanya: perbaikan yang berputar di masalah yang sama dua kali, atau
perubahan yang mulai merembet ke berkas di luar cakupan tahapnya.

### 8.2 Branch per tahap (untuk revert)

Setiap tahap masuk `staging` lewat PR dari branch-nya sendiri. Kalau satu tahap harus
dibatalkan, revert **merge commit**-nya (`git revert -m 1 <merge-commit>`) — kode ikut
kembali, tapi **migrasi database tidak**: jalankan blok rollback di bawah berkas migrasinya
secara manual.

| Tahap | Branch                                   | PR / merge commit ke `staging` | Migrasi yang dibawa                        |
| ----- | ---------------------------------------- | ------------------------------ | ------------------------------------------ |
| M1    | `feat/registration-source-academic-year` | #70 — `777450b`                | 7.1, 7.2, RLS + grant `registration_stats` |
| M2+M3 | `feat/registration-stats-module`         | #72 — `d0a0165`                | 7.4                                        |
| M4    | `feat/hero-stats`                        | #73 — `529572f`                | —                                          |
| M5    | `feat/event-module`                      | #74 — `76afd85`                | 7.3, 7.5, 7.6                              |
| M6    | `feat/event-public-pages`                | #75 — `3ef86e7`                | — (tidak ada migrasi; revert kode saja)    |
| M7    | `feat/event-landing-teaser`              | —                              | —                                          |

Isi kolom PR/merge commit setelah PR tahap itu di-merge.

**Perbaikan di luar tahap — jangan ikut di-revert bersama M mana pun:**

| Commit    | Masuk lewat                    | Isi                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `abcb15a` | langsung ke `staging` (urgent) | `web/modules/db/postgres.ts`: `max_pipeline: 0`, `max: 1` saat build (`NEXT_PHASE`), `idle_timeout: 20`. Build `/` dan `/event` macet 60 detik karena `postgres.js` mem-pipeline query lewat pooler Supabase mode transaksi (`:6543`), yang menukar hasil query — muncul sebagai `UNDEFINED_VALUE` di query tanpa parameter. M6 hanya membuatnya lebih sering muncul (menambah `/event` dan `sitemap.xml` yang query DB saat build); penyebabnya sudah ada sejak sebelum PRD ini, dan perbaikan `Promise.all` → berurutan di `Footer` (commit `e850ef4`) bukan akar masalahnya |

---

## 9. Skenario Penerimaan

Dijalankan berurutan di lingkungan yang datanya menyerupai produksi:

| Batch   | Kapan      | Skenario | Catatan                                                                                                                            |
| ------- | ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Batch 1 | Setelah M4 | 1–9      | Statistik pendaftar (F1–F3)                                                                                                        |
| Batch 2 | Setelah M7 | 10–25    | Event sekolah (F4–F6). **Skenario 12 boleh diuji lebih awal**, sebelum M7 — hasilnya bisa mengubah alur unggah poster (catatan F5) |

Pengujian dilakukan di server staging; lokal hanya dipakai untuk menelusuri error.

1. Buka `/admin/statistics`. Bagian "Angka sekolah" sudah terisi `683` dan `65` — nilai
   yang tadinya ada di kode. Bagian "Pendaftar": tahun ajaran `2027/2028` aktif, jumlah
   online dan offline terisi dari database, kolom isian masih 0
2. Ubah "Siswa aktif" jadi `690`, simpan. Buka landing page — hero menampilkan `690`
3. Isi kolom offline `120`, simpan. Total di layar bertambah 120
4. Buka landing page — angka "Pendaftar TA 2027/2028" muncul dan cocok dengan total di
   dashboard
5. Kosongkan "Guru & staf" di dashboard. Butir "Guru & staf" hilang dari hero, empat butir
   lain tetap tersusun rapi — bukan menyisakan lubang atau menampilkan "0"
6. Input satu pendaftar lewat `/admin/registrations/new`. Kembali ke `/admin/statistics`:
   baris **"offline sudah diinput"** bertambah 1, kolom isian **tidak berubah**, total
   bertambah tepat 1 — bukan 2
7. Daftar satu pendaftar lewat website sampai pembayaran selesai. Baris "online" bertambah
   1, total bertambah 1
8. Kosongkan penanda tahun ajaran aktif di database. Landing page tetap tampil normal,
   angka pendaftar hilang, angka siswa dan guru tetap tampil, tidak ada error
9. Buka form Profil Sekolah di `/admin/about` — kolom siswa aktif dan guru & staf **tidak
   ada di sana**, jadi tidak ada dua tempat mengubah angka yang sama (3.3)
10. Buat event baru berjudul "Akram 2026", kategori "Akram", tanggal, poster portrait, dan
    **simpan sebagai draf**. Halaman `/event` belum menampilkannya
11. Terbitkan event itu. Ia muncul di `/event` dan sebagai kartu di landing page
12. Salin URL event, tempel ke chat WhatsApp — muncul kartu berisi poster, judul, dan
    ringkasan. Klik membuka halaman event-nya
13. Sunting judul event jadi "Akram 2026 — Hari Kedua". URL lama **tetap terbuka**
14. Buat event kedua berkategori "Prestasi" dengan foto siswa dan tanggal. Ia tampil
    berdampingan di `/event`, dan filter kategori "Prestasi" menyaringnya dengan benar
15. Buka `/event` di HP lebar 390 px — poster portrait terbaca penuh, chip kategori bisa
    ditekan dengan jempol, tidak ada scroll horizontal di halaman
16. Dari `/event`, tekan menu "Tentang" di navbar — pengunjung dibawa ke section Tentang
    di landing page
17. Buka `/event/slug-yang-tidak-ada` — halaman 404, bukan error
18. Jadikan semua event draf. Section "Event Terbaru" di landing page hilang sepenuhnya,
    halaman tetap rapi
19. Buka `/sitemap.xml` — `/event` dan seluruh event terbit terdaftar
20. Login sebagai `admin` biasa (bukan superadmin): menu Statistik dan Event bisa dibuka;
    menu Pembayaran dan Kelola Admin tetap tidak terlihat
21. Ulangi langkah 2, 11, 12, dan 14 **seluruhnya dari HP di lebar 390 px**, dengan jempol
    saja: angka di hero terbaca, kartu event di landing bisa ditekan, halaman detail event
    terbaca tanpa mencubit layar, dan tombol bagikan ke WhatsApp berfungsi
22. Buka URL detail sebuah event terbit, lalu jadikan event itu draf dari admin. Buka ulang
    URL-nya — halaman 404, bukan poster yang masih tersisa di cache (catatan implementasi F5)
23. Dari `/event`, tekan tautan "Tentang" di **footer** dan logo sekolah di navbar — keduanya
    membawa ke landing page. Di landing page sendiri, menekan menu navbar tetap hanya
    menggulir, tidak memuat ulang halaman
24. Deploy ke staging selesai tanpa pesan "took more than 60 seconds". Setelah deploy, buka
    landing page dan `/event`: foto hero, angka siswa/guru/pendaftar, dan daftar event tampil
    sesuai dashboard — bukan kosong atau tertukar (perbaikan `abcb15a`, Bagian 8.2)
25. Buka landing page di HP lebar 390 px, gulir section "Event Terbaru" ke samping dengan
    jari — kartu berikutnya terlihat sebagian sebagai isyarat, dan gulirannya terjadi **di
    dalam wadah kartu**, bukan menyeret seluruh halaman (catatan implementasi F6, 6.5)

---

## 10. Risiko

| Risiko                                                  | Dampak                                                                | Penanganan                                                                                                                             |
| ------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Admin mengetik total offline, bukan sisanya             | Pendaftar terhitung dua kali, angka publik terlalu besar              | Label kolom tegas + keterangan berisi jumlah yang sudah diinput + total hidup sebelum simpan (F2). Sumber ditandai di record (F1)      |
| Admin lupa memindahkan tahun ajaran aktif               | Angka pendaftar tahun baru tidak muncul, atau angka lama terus tampil | Halaman statistik menampilkan tahun aktif secara mencolok. Pendaftaran tetap tersimpan meski tidak ada tahun aktif (F1)                |
| Angka publik dianggap resmi lalu dipertanyakan wali     | Sekolah harus menjelaskan selisih                                     | Yang tampil hanya total (D1). Rincian tetap bisa dibuka admin kapan saja untuk menjawab                                                |
| Poster diunggah dalam ukuran mentah dari WhatsApp/Canva | Halaman berat, kuota wali habis                                       | Batas ukuran dan format diperiksa saat unggah; kartu memakai ukuran tampil yang wajar, poster penuh hanya di halaman detail            |
| Slug berubah setelah link tersebar                      | Semua link yang sudah dikirim mati                                    | Slug dikunci setelah terbit (4.4), diuji di skenario 13                                                                                |
| Angka siswa/guru diketik keliru (salah satu digit)      | Angka salah langsung tampil ke publik tanpa perantara                 | Nilai negatif ditolak database dan form. Perubahannya satu kolom dan bisa dikoreksi dalam hitungan detik dari halaman yang sama (F2)   |
| Admin mencari kolom siswa/guru di Profil Sekolah        | Mengira fiturnya belum ada                                            | Form Profil Sekolah diberi keterangan bahwa angka statistik diatur di halaman Statistik (3.3), diuji di skenario 9                     |
| Kategori jadi berantakan karena teks bebas              | Filter penuh duplikat salah ketik                                     | Form menyarankan kategori yang pernah dipakai. Diterima secara sadar sebagai ongkos dari D4 — lihat 4.3                                |
| Halaman `/event` sepi karena tidak ada yang mengisi     | Fitur mubazir                                                         | Teaser di landing (F6) membuat event terlihat. Kalau kosong, section-nya menghilang sendiri sehingga situs tidak terlihat terbengkalai |
| Navbar dipakai di halaman selain landing                | Menu anchor tidak berfungsi dari `/event`                             | Anchor ditulis absolut `/#tentang` (F5), diuji di skenario 16                                                                          |
| Event draf bocor ke publik                              | Poster acara terbit sebelum waktunya                                  | Penyaringan `is_published` dilakukan di query repository, bukan di komponen (F5)                                                       |
| WhatsApp tidak menampilkan `og:image` berformat WebP    | Link event tampil tanpa gambar poster — G6 tidak tercapai             | Diuji paling awal lewat skenario 12 di staging. Kalau gagal, dibahas perbaikan alur unggah (salinan JPEG untuk OG) — lihat catatan F5  |

---

## 11. Alur Pendaftaran Baru (PMB & Pindahan)

**Status:** Draft — menunggu persetujuan
**Tanggal:** 2026-11-14
**Acuan:** `Form PMB Lengkap.xls` (FORM BIODATA, Pernyataan keuangan, Surat Ket Diterima) dan
`Form Observasi Fix.xlsx` (Petunjuk, Input Observasi, Profil Kesiapan) dari sekolah.

Konvensi kode, migrasi, dan clean code mengikuti bab 6. Fitur di bab ini dinomori
lanjut dari bab 5 (F7–F19).

### 11.1 Latar Belakang

#### 11.1.1 Alur sekarang

Orang tua mengisi form lengkap, **membayar lewat DOKU, baru data tersimpan**. Setelah itu
semua proses (tes, wawancara, surat) berjalan di kertas dan Excel.

Masalahnya:

- Orang tua harus bayar dulu sebelum tahu ada tes dan wawancara. Banyak yang mundur.
- Form lengkap terlalu panjang untuk langkah pertama.
- Guru mengetik ulang data anak ke lembar observasi, surat pernyataan, dan surat diterima.
- Sekolah tidak tahu berapa calon pendaftar untuk tahun-tahun berikutnya.

#### 11.1.2 Alur baru

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

### 11.2 Keputusan yang Sudah Diambil

| #   | Keputusan                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| K1  | Tidak ada pembayaran sebelum form terkirim                                                                                                                     |
| K2  | Klik "Daftar" → pilih **PMB** atau **Siswa Pindahan**                                                                                                          |
| K3  | Form pendek: nama anak, jenis kelamin, tanggal lahir, asal sekolah, program, tahun ajaran target, nama & no. WA orang tua, email (opsional)                    |
| K4  | Program **Tahfizh / Unggulan** dipilih orang tua                                                                                                               |
| K5  | Tahun ajaran target: TA yang sedang dibuka sampai +5 (contoh sekarang: 2027/2028 – 2032/2033)                                                                  |
| K6  | Setelah kirim form pendek → langsung ke WhatsApp CP dengan pesan terisi                                                                                        |
| K7  | Form lengkap lewat link khusus dari CP. Isian form pendek sudah terisi dan bisa diubah. Email wajib di sini                                                    |
| K8  | Tidak ada unggah berkas. Panitia mencentang berkas kertas yang sudah diterima (akta, KK, KTP ayah & ibu; rapor & NISN untuk pindahan)                          |
| K9  | Jadwal tes cukup tanggal + jam yang dicatat CP. Tanpa sistem slot                                                                                              |
| K10 | Pengingat: email otomatis H-1 ke orang tua + daftar "Jadwal hari ini & besok" di dashboard dengan tombol WA manual. Tanpa WA otomatis                          |
| K11 | Pewawancara anak & pewawancara orang tua dipilih dari akun PMB. Guru boleh "Ambil" sendiri; kepsek/wakepsek boleh menugaskan siapa saja                        |
| K12 | Biaya pendaftaran dibayar di sekolah saat tes: tunai/transfer (ditandai lunas) atau DOKU                                                                       |
| K13 | Profil Kesiapan & Surat Keterangan Diterima hanya bisa diunduh/dikirim **setelah biaya pendaftaran lunas**                                                     |
| K14 | Dokumen dikirim ke orang tua sebagai **link PDF lewat WA**, bukan lampiran (lampiran butuh WhatsApp Business API berbayar). Tombol "Unduh PDF" untuk dicetak   |
| K15 | Nominal surat pernyataan diatur dari website, hanya oleh kepsek (dan admin dev)                                                                                |
| K16 | Pindahan: alur sama persis, **kecuali tes murid** — dikerjakan manual sesuai jenjang kelas, tanpa 56 indikator, jadi tanpa Profil Kesiapan                     |
| K17 | Angka pendaftar dihitung per **tahun ajaran target**. Landing page = TA yang sedang dibuka. Statistik = rincian per TA target                                  |
| K18 | Peran akun diganti: Kepsek, Wakepsek, TU, Guru, Admin (dev)                                                                                                    |
| K19 | Nomor pendaftaran: urut per TA target, mis. `2728-001`                                                                                                         |
| K20 | WA setelah form pendek ke **satu nomor CP PMB**. CP di Surat Diterima (bagian pembayaran uang masuk) berbeda dan di luar alur website — keduanya diatur kepsek |
| K21 | Usia per 1 Juli: ≥ 6 tahun = Cukup. Di bawah 6 tahun = dengan persyaratan khusus, orang tua diminta menghubungi CP PMB                                         |
| K22 | Nomor surat: `<urut>.09/PMB-SDI-DC/<bulan Romawi>/<tahun>`. `09` = nomor unit SDI Darussalam Cikunir di yayasan                                                |
| K23 | PDF dibuat dengan `@react-pdf/renderer`                                                                                                                        |
| K24 | Input Pendaftar Manual tetap ada, diisi guru dengan **form lengkap** langsung                                                                                  |
| K25 | Nomor urut surat mulai dari 001 lagi tiap tahun kalender surat                                                                                                 |
| K26 | Nomor urut pendaftaran mulai dari 001 lagi untuk tiap TA target                                                                                                |
| K27 | Terhitung **pendaftar** setelah **form lengkap** dikirim (`full_form_completed_at` terisi). Form pendek belum dihitung                                         |

#### 11.2.1 Hasil observasi bukan penentu otomatis

Lembar Petunjuk menyebut: _"Hasil bukan diagnosis dan bukan satu-satunya dasar penerimaan."_
Jadi Profil Kesiapan hanya **bahan pertimbangan**. Diterima atau tidak tetap dipilih panitia.
Ini juga membuat PMB dan Pindahan memakai tombol keputusan yang sama.

#### 11.2.2 Dimensi terkuat/terlemah dihitung dari persentase

Di Excel, "dimensi paling kuat" diambil dari skor mentah. Dimensi dengan indikator terbanyak
(Kesiapan Belajar, maks. 32) hampir selalu menang. Di website dihitung dari **persentase**
(skor ÷ skor maks.). Kalau persentase sama, ambil urutan dimensi paling atas.

#### 11.2.3 Isi surat adalah salinan, bukan data induk

Saat surat pertama dibuat, isinya diambil dari data pendaftar. Setelah itu yang diubah di surat
**hanya mengubah surat**. Alasannya: surat yang sudah dicetak dan ditandatangani tidak boleh
berubah diam-diam saat biodata diperbaiki. Kalau biodata diperbaiki sesudahnya, ada tombol
"Ambil ulang dari biodata".

---

### 11.3 Status Pendaftar

| Kode        | Label          | Kapan                                               |
| ----------- | -------------- | --------------------------------------------------- |
| `new`       | Baru           | Form pendek masuk                                   |
| `scheduled` | Terjadwal      | Jadwal tes dicatat (otomatis)                       |
| `tested`    | Sudah Tes      | Observasi atau hasil tes manual disimpan (otomatis) |
| `accepted`  | Diterima       | Panitia memilih Diterima                            |
| `rejected`  | Tidak Diterima | Panitia memilih Tidak Diterima                      |
| `cancelled` | Batal          | Orang tua mundur — bisa dari status mana pun        |

Status berpindah **dari aksi**, bukan dipilih bebas (kecuali Batal). Aturannya di service,
bukan di frontend.

Tiga penanda lain tampil sebagai chip ikon, terpisah dari status:

- **Form lengkap** — sudah/belum diisi orang tua
- **Lunas** — biaya pendaftaran
- **Berkas** — jumlah berkas kertas yang sudah diterima

**Data lama:** `pending` dan `in_progress` → `new`, `registered` → `accepted`,
`not_registered` → `cancelled`.

---

### 11.4 Peran & Hak Akses

| Hak                                  | Kepsek | Wakepsek | TU  | Guru                | Admin (dev) |
| ------------------------------------ | ------ | -------- | --- | ------------------- | ----------- |
| Lihat Akun & Pembayaran (Read Only)  | ✓      | ✓        |     |                     | ✓           |
| Undang & ubah akun                   | ✓      |          |     |                     | ✓           |
| Atur nominal & isi tetap surat       | ✓      |          |     |                     | ✓           |
| Tandai lunas biaya pendaftaran       | ✓      | ✓        |     |                     | ✓           |
| Jadwal tes, "Ambil" pendaftar        | ✓      | ✓        | ✓   | ✓                   | ✓           |
| Tugaskan pewawancara ke orang lain   | ✓      | ✓        |     |                     | ✓           |
| Isi observasi & surat pernyataan     | ✓      | ✓        |     | ✓ (yang ditugaskan) | ✓           |
| Putuskan hasil & buat surat diterima | ✓      | ✓        |     | ✓ (yang ditugaskan) | ✓           |
| Konten website                       | ✓      | ✓        | ✓   | ✓                   | ✓           |

- Kode peran (Inggris): `principal`, `vice_principal`, `administration_staff`, `teacher`,
  `developer`. Label di layar: Kepsek, Wakepsek, TU, Guru, Admin.
- Kode `developer`, **bukan `admin`**. Nilai `admin` yang lama artinya admin biasa. Kalau dipakai
  ulang untuk "semua hak", akun lama bisa tiba-tiba punya semua hak.
- Akun Admin tidak muncul di daftar pewawancara.
- Hak dicek di service lewat satu daftar hak per peran (`modules/shared/constant`), bukan
  `role === "superadmin"` yang tersebar di 33 tempat seperti sekarang.
- Guru yang menguji boleh memutuskan hasil dan membuat surat. Yang tidak boleh untuk guru (dan
  TU): menandai lunas biaya pendaftaran — itu hanya kepsek atau wakepsek.

- Wakepsek adalah panitia utama PMB, jadi ia perlu tahu siapa saja yang punya akun dan berapa
  biaya pendaftarannya. Ia membuka Akun dan Pembayaran dengan chip **Read Only**; perubahan
  diminta langsung ke Kepsek, tanpa fitur persetujuan di sistem (`view_accounts`,
  `view_admission_settings`, ditambahkan 17 Nov 2026).
- Perkiraan potongan DOKU dihitung di service `payment-settings` dan dikirim di respons
  `GET /api/payment-settings` (`doku_estimates`), bukan di halaman.
- Peran Admin hanya bisa diberikan, diubah, atau dihapus oleh akun Admin
  (`manage_developer_accounts`). Kepsek hanya melihat 4 pilihan peran.
- Peran dan status akun sendiri tidak bisa diubah. Kepsek atau Admin aktif yang terakhir tidak
  bisa diturunkan, dinonaktifkan, atau dihapus, supaya halaman Akun selalu punya pengelola.
- Halaman "Kelola Admin" berganti nama jadi **"Akun"**. Peran dipilih langsung di kartu akun dan
  di dialog undang (desain: halaman "Akun — Peran" di `docs/design/sdi-darussalam-cikunir.figcraft`).
- Token login menyimpan peran. Setelah PR 1 rilis, token lama berperan `superadmin`/`admin`
  ditolak, jadi semua akun login ulang lewat `/masuk-sekolah` (token akses paling lama 8 jam).

**Pemetaan akun lama** (lewat migrasi): `superadmin` → `principal`, `admin` → `teacher`. Setelah
deploy, peran yang tidak pas diubah dari halaman Akun. Akun Admin pertama tidak bisa dibuat
dari halaman Akun (hanya Admin yang boleh memberi peran Admin), jadi pemilik repo mengubah
peran akunnya sendiri sekali lewat SQL di staging dan production.

---

### 11.5 Model Data

Prinsip: **menambah**, bukan mengganti. Tabel `ppdb_registrations` dan turunannya tetap dipakai.

#### 11.5.1 Perubahan tabel yang ada

**`ppdb_registrations`**

| Kolom                    | Isi                                                               |
| ------------------------ | ----------------------------------------------------------------- |
| `registration_number`    | Nomor pendaftaran untuk dicari CP dan ditulis di WA (format: K19) |
| `program`                | `tahfizh` / `unggulan`                                            |
| `academic_year`          | **Kini berarti TA target** (sudah ada, artinya diperjelas)        |
| `contact_name`           | Nama orang tua dari form pendek                                   |
| `contact_relation`       | `father` / `mother` / `guardian`                                  |
| `contact_phone`          | No. WA orang tua                                                  |
| `full_form_completed_at` | Kapan form lengkap dikirim orang tua                              |
| `received_documents`     | `text[]` berisi kode berkas yang sudah diterima                   |
| `status`                 | Nilai baru (11.3)                                                 |

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

**`admin_users.role`** — nilai baru (11.4).

#### 11.5.2 Tabel baru

| Tabel                     | Domain                | Isi                                                                                              |
| ------------------------- | --------------------- | ------------------------------------------------------------------------------------------------ |
| `registration_form_links` | `registration-link`   | Token link form lengkap (hash), kedaluwarsa, dibuat oleh                                         |
| `admission_tests`         | `admission-test`      | Jadwal tes, pewawancara anak, pewawancara ortu, catatan tes manual, pengingat terkirim           |
| `observations`            | `observation`         | Tanggal, observer, catatan awal, rekomendasi                                                     |
| `observation_scores`      | `observation`         | 56 baris: nomor indikator, skor 1–4, catatan                                                     |
| `admission_settings`      | `admission-settings`  | Satu baris: nominal per program, diskon, batas bayar, rekening, penanda tangan, CP PMB, CP surat |
| `financial_statements`    | `financial-statement` | Salinan isi surat pernyataan (jsonb) + tanggal tanda tangan                                      |
| `acceptance_letters`      | `acceptance-letter`   | Nomor surat, tanggal, salinan isi surat (jsonb)                                                  |
| `document_links`          | `acceptance-letter`   | Token link PDF untuk orang tua (hash), kedaluwarsa                                               |

- **Daftar 56 indikator dan 9 dimensi disimpan di kode** (`modules/shared/constant`), bukan di
  tabel. Isinya tetap dan berubah paling sekali setahun lewat rilis. Skor menyimpan nomor
  indikator.
- **Token** disimpan sebagai hash, sama seperti token undangan admin.
- **Dua jenis CP di `admission_settings`:** satu nomor **CP PMB** (tujuan WA setelah form pendek,
  dan yang dihubungi bila usia di bawah 6 tahun), dan daftar **CP surat** ("Contact" di bawah
  Surat Diterima, urusan pembayaran uang masuk).
- **Usia per 1 Juli** tahun masuk dihitung di service (Excel: DATEDIF ke 1 Juli).

#### 11.5.3 Hitungan pendaftar

`registration-stats` sudah menghitung per `academic_year`. Karena kolom itu kini TA target,
landing page otomatis menampilkan TA yang sedang dibuka. `offline_count` tetap ada untuk
pendaftar kertas yang tidak diinput.

Yang dihitung hanya baris dengan `full_form_completed_at` terisi (K27). Saat mengisi form lengkap, orang tua
sudah tahu ada tes, wawancara, dan biaya pendaftaran, jadi datanya serius. Menunggu lunas terlalu lama,
apalagi saat open house atau gelombang pendaftaran. Input Pendaftar Manual (K24) langsung terhitung
karena diisi dengan form lengkap.

---

### 11.6 Daftar Fitur

#### F7 — Peran baru

- Migrasi peran (11.4), halaman Akun memakai 5 peran.
- Menu sidebar dan tombol mengikuti hak, bukan `superadminOnly`.

#### F8 — Form pendek & WhatsApp

- Tombol "Daftar" membuka pilihan **PMB / Siswa Pindahan**.
- Form pendek (K3). Tetap ada pengecekan duplikat dan pembatas per IP.
- Setelah kirim: tampil **alur pendaftaran** (form lengkap → tes & wawancara, biaya pendaftaran
  Rp … dibayar di sekolah saat tes → hasil). Tombol "Oke" membuka **WA CP PMB** dengan pesan:
  nama anak, nomor pendaftaran, program, TA.
- PMB: bila usia anak per 1 Juli TA target di bawah 6 tahun, tampil chip singkat
  "Di bawah 6 tahun — persyaratan khusus, hubungi sekolah". Form tetap bisa dikirim.
- Pembayaran DOKU di depan form **dihapus**.

#### F9 — Form lengkap lewat link

- Di detail pendaftar, tombol **"Kirim form lengkap"** → WA terbuka ke nomor orang tua dengan link.
- Link membuka form lengkap (isi FORM BIODATA) yang sudah terisi. Bisa dibuka lagi sampai
  hari tes. CP bisa kirim ulang (link lama tidak berlaku).
- Form lengkap = `RegistrationForm.tsx` yang ada, dipecah per bagian (berkas ini 1.164 baris,
  kena aturan clean code karena disentuh).

#### F10 — Daftar & detail pendaftar (admin)

- Daftar: cari nama/nomor, saring status, TA target, program, PMB/Pindahan.
- Detail: biodata, chip Form lengkap/Lunas/Berkas, jadwal, pewawancara, tombol aksi sesuai tahap.
- Centang berkas kertas (K8).
- **Input Pendaftar Manual** (K24): guru langsung mengisi form lengkap, sumber `offline`, status
  Baru. Tidak ada isian pembayaran di sini lagi — lunas dicatat lewat F12.
- `registrations/page.tsx` (910 baris) dipecah karena disentuh.

#### F11 — Jadwal tes & pewawancara

- CP mengisi tanggal + jam → status Terjadwal.
- Pewawancara anak & ortu: dropdown dengan kolom cari dari akun PMB; tombol **"Ambil"** untuk
  diri sendiri.
- Dashboard: kartu **"Jadwal hari ini & besok"** dengan tombol WA pengingat per pendaftar.
- Email pengingat H-1 ke orang tua yang punya email: route cron
  `/api/cron/send-test-reminders`, sekali sehari. Dicatat supaya tidak terkirim dua kali.

#### F12 — Pembayaran biaya pendaftaran

- **Tandai lunas**: pilih Tunai/Transfer, nomor kuitansi opsional. Tercatat siapa dan kapan.
  Pembatalan lunas hanya kepsek/admin.
- **DOKU**: tombol "Bayar lewat DOKU" membuat link pembayaran untuk pendaftar itu. Link bisa
  dibuka di HP orang tua (kirim WA). Lunas otomatis dari notifikasi DOKU, seperti sekarang.
- Halaman Transaksi tetap, kini selalu terhubung ke pendaftar.

#### F13 — Observasi & Profil Kesiapan (PMB saja)

- Layar isi 56 indikator per dimensi: skor 1–4 dengan tombol (bukan ketik), catatan per
  indikator opsional. Keterangan skor dari lembar Petunjuk tampil sebagai ikon info.
- Header terisi dari biodata: nama, nomor, tanggal lahir, asal TK, usia per 1 Juli, observer.
- Profil Kesiapan dihitung di service: per dimensi (skor, maks., kategori), total, kesimpulan,
  dimensi terkuat & terlemah (11.2.2), catatan/rekomendasi diketik observer.
- Simpan → status Sudah Tes.

#### F14 — Tes manual (Pindahan)

- Cukup catatan hasil tes + tanggal. Simpan → status Sudah Tes.

#### F15 — Surat pernyataan keuangan

- Terisi dari biodata (ayah, ibu, alamat, anak, kelas, TA) dan `admission_settings` (nominal
  program pilihan, diskon sesuai asal TK).
- Bisa diubah (11.2.3). Cetak PDF untuk ditandatangani.

#### F16 — Hasil & Surat Keterangan Diterima

- Tombol **Diterima / Tidak Diterima** → status.
- Diterima → Surat Keterangan Diterima terisi: nomor surat, nama, asal sekolah, kelas + program,
  usia, batas bayar, rekening, penanda tangan, CP surat. Bisa diubah.
- Nomor surat otomatis (K22): nomor urut naik per tahun surat, bisa diubah. Kode unit `09` dan
  `PMB-SDI-DC` tetap di kode.
- Usia: "6 Tahun 7 Bulan (Cukup)" bila ≥ 6 tahun per 1 Juli; di bawahnya
  "(Dengan persyaratan khusus)".

#### F17 — Dokumen untuk orang tua

- Tombol **Unduh PDF** dan **Kirim ke WA** untuk Profil Kesiapan (PMB) dan Surat Diterima.
- Keduanya terkunci sampai Lunas (K13). Penguncian dicek di backend, bukan hanya tombol disembunyikan.
- Kirim ke WA → link `/dokumen/<token>` yang menampilkan tombol unduh kedua PDF.

#### F18 — Pengaturan PMB (kepsek)

- Halaman baru: nominal per program (uang awal tahun, iuran Juli), diskon lulusan TK Darussalam /
  TK lain, batas pembayaran, rekening, nama penanda tangan, daftar CP.
- Biaya pendaftaran tetap di halaman Pembayaran yang sekarang.

#### F19 — Statistik pendaftar

- Rincian per **TA target**: form pendek masuk vs form lengkap (yang dihitung, K27), per status (alur Baru → Terjadwal → Sudah Tes → Diterima),
  per program, PMB/Pindahan, online/offline.
- Didesain dulu di FigCraft (HP, tablet, desktop) sebelum dikodekan. Data harus cepat dibaca:
  angka utama besar, perbandingan dengan bar, bukan tabel panjang.

---

### 11.7 Migrasi

Semua migrasi wajib aman untuk container lama yang masih jalan beberapa detik (6.3).
Karena itu perubahan nilai `CHECK` dibuat **dua langkah**:

1. PR yang memperkenalkan nilai baru: `CHECK` menerima nilai lama **dan** baru, lalu data lama
   dipetakan.
2. PR berikutnya: nilai lama dibuang dari `CHECK`.

Berlaku untuk `admin_users.role` dan `ppdb_registrations.status`.

`DROP NOT NULL` dan kolom/tabel baru aman langsung.

**Hitungan pendaftar lama tetap:** semua baris lama berasal dari form lengkap, jadi
`full_form_completed_at` di-backfill dengan `created_at`. Begitu juga pendaftaran dari sesi DOKU lama
yang selesai setelah F8 rilis.

**Pembayaran DOKU yang menggantung:** saat F8 rilis, sesi DOKU lama (bayar dulu, data belum
tersimpan) yang masih `pending` dibiarkan bisa selesai sampai kedaluwarsa. Jalur
`settleAsRegistration` baru dihapus di PR berikutnya.

---

### 11.8 Tahapan Pengerjaan

| PR  | Isi                                        | Fitur              |
| --- | ------------------------------------------ | ------------------ |
| 1   | Peran baru                                 | F7                 |
| 2   | Form pendek, WA, form lengkap, status baru | F8, F9, F10        |
| 3   | Jadwal, pewawancara, pengingat, pembayaran | F11, F12           |
| 4   | Observasi, tes manual, Profil Kesiapan     | F13, F14           |
| 5   | Surat-surat, PDF, pengaturan PMB           | F15, F16, F17, F18 |
| 6   | Statistik + buang nilai lama dari `CHECK`  | F19, 11.7          |

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

### 11.9 Butuh Pihak Lain

- **Infra:** cron harian untuk `/api/cron/send-test-reminders` (PR 3). Pesan disiapkan saat
  route-nya siap.
- **Library PDF baru:** `@react-pdf/renderer` (K23). Berjalan di Node biasa, tanpa browser
  headless, jadi ringan untuk server.

---

### 11.10 Pertanyaan Terbuka

Semua pertanyaan P1–P8 sudah dijawab 14 Nov 2026 dan masuk ke K19–K24, 11.4, dan 11.8.
Asumsi A1 dan A2 disetujui 17 Nov 2026 dan masuk ke K25–K26. Tidak ada pertanyaan terbuka.

---

### 11.11 Risiko

| Risiko                                                                             | Penanganan                                                         |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Form pendek tanpa bayar mengundang data iseng                                      | Pembatas per IP tetap; status Batal; CP menyaring saat menghubungi |
| Link form lengkap/dokumen bocor                                                    | Token acak, disimpan hash, kedaluwarsa, bisa dibuat ulang          |
| Container lama menulis nilai lama saat migrasi                                     | `CHECK` dua langkah (11.7)                                         |
| PDF berat di server                                                                | Dibuat saat diminta, sekali per anak; library tanpa browser        |
| Berkas lama yang disentuh besar (RegistrationForm, registrations page, repository) | Dipecah sesuai 6.6 di PR yang menyentuhnya                         |

---

## 12. Backlog

Dicatat supaya tidak diselundupkan ke pekerjaan yang sedang berjalan.

**Statistik & event (bab 1–10):**

- `Tahun berdiri` dan `Akreditasi` ikut bisa diedit dari dashboard — kalau ternyata memang
  pernah dibutuhkan (3.3)
- Statistik pendaftar per gelombang dan grafik tren antar tahun ajaran
- Galeri banyak foto per event
- Kategori terstruktur beserta warnanya, dikelola dari dashboard
- Halaman arsip per tahun (`/event/2026`)
- Jumlah dilihat per event, untuk tahu mana yang benar-benar dibaca
- Broadcast WhatsApp otomatis saat event terbit
- Menggabungkan Kegiatan, Prestasi, dan Event menjadi satu model konten
- Kompresi gambar otomatis saat unggah

**Alur pendaftaran (bab 11):**

- WhatsApp otomatis (pengingat & dokumen) lewat WhatsApp Business API
- Sistem slot jadwal tes
- QR pembayaran DOKU di layar
- Daftar indikator observasi bisa diubah dari website
