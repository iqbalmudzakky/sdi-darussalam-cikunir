BEGIN;

-- Migration: jadwal tes & pewawancara (PRD 11.5.2, F11, K9-K11)
-- Satu pendaftar satu jadwal: tanggal + jam tanpa slot. Pewawancara anak dan orang tua
-- dipilih dari akun panitia. reminded_at diisi saat panitia menandai "Sudah diingatkan"
-- dan dikosongkan lagi bila tanggal/jam diubah.
SET LOCAL lock_timeout = '10s';

CREATE TABLE IF NOT EXISTS admission_tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL UNIQUE REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    test_date date NOT NULL,
    test_time time NOT NULL,
    child_interviewer_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    parent_interviewer_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    reminded_at timestamptz,
    reminded_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admission_tests_test_date_idx ON admission_tests (test_date);

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- DROP TABLE IF EXISTS admission_tests;
-- COMMIT;
