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
--
-- Saat migrasi ini dijalankan produksi belum punya satu pun baris pendaftaran,
-- jadi UPDATE ini hanya benar-benar bekerja di staging yang isinya data uji.
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
