BEGIN;

-- Migration: tabel login_attempts
-- Mencatat login admin yang GAGAL, supaya auth.login bisa menolak percobaan
-- beruntun (per email dan per IP) sebelum sandi diperiksa. Login berhasil
-- menghapus catatan email itu. IP disimpan karena memang itu yang dibatasi;
-- barisnya dihapus cron cleanup-tokens setelah 24 jam.
CREATE TABLE IF NOT EXISTS login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    ip_address text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_email_created_at_idx
    ON login_attempts (email, created_at);

CREATE INDEX IF NOT EXISTS login_attempts_ip_address_created_at_idx
    ON login_attempts (ip_address, created_at);

COMMIT;

-- Rollback (jalankan manual, bukan bagian dari migrasi di atas):
-- BEGIN;
-- DROP TABLE IF EXISTS login_attempts;
-- COMMIT;
