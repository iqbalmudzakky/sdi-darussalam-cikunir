BEGIN;

-- Migration: create table registrations
-- stores "Formulir Pendaftaran Online" submissions from the public Kontak
-- section. ip_address is captured for the rate-limit/spam checks done in
-- the API route (not enforced here at the DB level).
CREATE TABLE IF NOT EXISTS registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_name text NOT NULL,
    student_name text NOT NULL,
    whatsapp text NOT NULL,
    email text NOT NULL,
    message text NOT NULL DEFAULT '',
    ip_address text,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS registrations;
-- COMMIT;
