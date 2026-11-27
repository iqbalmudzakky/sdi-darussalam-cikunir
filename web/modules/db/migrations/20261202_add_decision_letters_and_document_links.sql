BEGIN;

-- Migration: Surat Keterangan Diterima/Tidak Diterima + link dokumen untuk orang tua (PRD F16, F17, K22, K25)
-- Nomor urut surat disimpan di kolom agar nomor berikutnya bisa dihitung per tahun surat dan tidak dobel.
SET LOCAL lock_timeout = '10s';

ALTER TABLE admission_letters ADD COLUMN IF NOT EXISTS letter_year integer;
ALTER TABLE admission_letters ADD COLUMN IF NOT EXISTS letter_sequence integer;

CREATE UNIQUE INDEX IF NOT EXISTS admission_letters_number_key
    ON admission_letters (letter_year, letter_sequence)
    WHERE kind = 'decision';

CREATE TABLE IF NOT EXISTS document_links (
    registration_id uuid PRIMARY KEY REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- DROP TABLE IF EXISTS document_links;
-- DROP INDEX IF EXISTS admission_letters_number_key;
-- ALTER TABLE admission_letters DROP COLUMN IF EXISTS letter_sequence;
-- ALTER TABLE admission_letters DROP COLUMN IF EXISTS letter_year;
-- COMMIT;
