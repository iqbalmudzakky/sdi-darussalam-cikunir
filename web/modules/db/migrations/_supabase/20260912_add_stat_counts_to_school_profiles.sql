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
