BEGIN;

-- Migration: nama akun panitia (PRD F18a)
-- Sampai endpoint SSO siap, nama diisi kepsek/wakepsek di halaman Akun. Kosong = tampil bagian depan email.
SET LOCAL lock_timeout = '10s';

ALTER TABLE admin_users
    ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- ALTER TABLE admin_users DROP COLUMN IF EXISTS full_name;
-- COMMIT;
