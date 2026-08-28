BEGIN;

-- Migration: add hero_video_url to school_profiles
--
-- Hero sekarang bisa menampilkan video YouTube sebagai ganti foto gedung.
-- Kolomnya terpisah dari photo_url supaya foto lama tidak hilang saat sekolah
-- mencoba video lalu ingin kembali ke foto — cukup kosongkan kolom ini.
--
-- Sengaja TIDAK memakai kolom `youtube` yang sudah ada: kolom itu tautan kanal
-- untuk ikon media sosial di footer, bukan video yang diputar di hero.
ALTER TABLE school_profiles
    ADD COLUMN IF NOT EXISTS hero_video_url text NOT NULL DEFAULT '';

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE school_profiles DROP COLUMN IF EXISTS hero_video_url;
-- COMMIT;
