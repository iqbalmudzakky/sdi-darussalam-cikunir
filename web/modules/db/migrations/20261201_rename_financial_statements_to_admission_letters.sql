BEGIN;

-- Migration: financial_statements jadi tabel surat umum admission_letters (PRD 11.2.3)
-- Satu baris per pendaftar per jenis surat: 'statement' (surat pernyataan) dan 'decision'
-- (Surat Keterangan Diterima/Tidak Diterima, tahap 2b).
SET LOCAL lock_timeout = '10s';

ALTER TABLE financial_statements RENAME TO admission_letters;

ALTER TABLE admission_letters
    ADD COLUMN kind text NOT NULL DEFAULT 'statement'
        CONSTRAINT admission_letters_kind_check CHECK (kind IN ('statement', 'decision'));
ALTER TABLE admission_letters ALTER COLUMN kind DROP DEFAULT;

ALTER TABLE admission_letters DROP CONSTRAINT financial_statements_pkey;
ALTER TABLE admission_letters ADD CONSTRAINT admission_letters_pkey PRIMARY KEY (registration_id, kind);

ALTER TABLE admission_letters
    RENAME CONSTRAINT financial_statements_registration_id_fkey TO admission_letters_registration_id_fkey;
ALTER TABLE admission_letters
    RENAME CONSTRAINT financial_statements_created_by_fkey TO admission_letters_created_by_fkey;
ALTER TABLE admission_letters
    RENAME CONSTRAINT financial_statements_updated_by_fkey TO admission_letters_updated_by_fkey;

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- ALTER TABLE admission_letters DROP CONSTRAINT admission_letters_pkey;
-- DELETE FROM admission_letters WHERE kind <> 'statement';
-- ALTER TABLE admission_letters DROP COLUMN kind;
-- ALTER TABLE admission_letters ADD CONSTRAINT financial_statements_pkey PRIMARY KEY (registration_id);
-- ALTER TABLE admission_letters RENAME CONSTRAINT admission_letters_registration_id_fkey TO financial_statements_registration_id_fkey;
-- ALTER TABLE admission_letters RENAME CONSTRAINT admission_letters_created_by_fkey TO financial_statements_created_by_fkey;
-- ALTER TABLE admission_letters RENAME CONSTRAINT admission_letters_updated_by_fkey TO financial_statements_updated_by_fkey;
-- ALTER TABLE admission_letters RENAME TO financial_statements;
-- COMMIT;
