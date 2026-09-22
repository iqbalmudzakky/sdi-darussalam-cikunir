BEGIN;

-- Migration: satu NIK siswa hanya boleh muncul sekali.
--
-- Penjagaan duplikat di aplikasi (existsDuplicateByNik) memeriksa dulu baru
-- menyisipkan, jadi dua request yang datang bersamaan bisa sama-sama lolos
-- pemeriksaan lalu sama-sama menyimpan. Hanya constraint di database yang
-- benar-benar menutup celah itu.
--
-- Sengaja hanya pada NIK siswa. NIK orang tua di ppdb_registration_parents
-- tidak boleh unik: dua kakak beradik yang mendaftar wajar memakai NIK ayah
-- dan ibu yang sama.
--
-- Prasyarat: tidak ada NIK kembar yang tersisa. Periksa dengan
--   SELECT nik, COUNT(*) FROM ppdb_registration_students
--   GROUP BY nik HAVING COUNT(*) > 1;
-- Migrasi ini gagal — dan seluruh transaksinya dibatalkan — kalau masih ada.
ALTER TABLE ppdb_registration_students
    ADD CONSTRAINT ppdb_registration_students_nik_key UNIQUE (nik);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE ppdb_registration_students
--     DROP CONSTRAINT IF EXISTS ppdb_registration_students_nik_key;
-- COMMIT;
