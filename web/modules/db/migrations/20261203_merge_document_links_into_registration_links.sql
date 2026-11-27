BEGIN;

-- Migration: link form lengkap dan link dokumen orang tua digabung jadi satu tabel registration_links (PRD 11.2.3)
-- Satu link aktif per pendaftar per jenis: 'form' (form lengkap) dan 'documents' (PDF untuk orang tua, F17).
SET LOCAL lock_timeout = '10s';

ALTER TABLE registration_form_links RENAME TO registration_links;

ALTER TABLE registration_links
    ADD COLUMN kind text NOT NULL DEFAULT 'form'
        CONSTRAINT registration_links_kind_check CHECK (kind IN ('form', 'documents'));
ALTER TABLE registration_links ALTER COLUMN kind DROP DEFAULT;

ALTER TABLE registration_links DROP CONSTRAINT registration_form_links_registration_id_key;
ALTER TABLE registration_links
    ADD CONSTRAINT registration_links_registration_id_kind_key UNIQUE (registration_id, kind);

ALTER TABLE registration_links
    RENAME CONSTRAINT registration_form_links_pkey TO registration_links_pkey;
ALTER TABLE registration_links
    RENAME CONSTRAINT registration_form_links_token_hash_key TO registration_links_token_hash_key;
ALTER TABLE registration_links
    RENAME CONSTRAINT registration_form_links_registration_id_fkey TO registration_links_registration_id_fkey;
ALTER TABLE registration_links
    RENAME CONSTRAINT registration_form_links_created_by_fkey TO registration_links_created_by_fkey;

INSERT INTO registration_links (registration_id, kind, token_hash, expires_at, created_by, created_at)
SELECT registration_id, 'documents', token_hash, expires_at, created_by, created_at
FROM document_links;

DROP TABLE document_links;

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- CREATE TABLE document_links (
--     registration_id uuid PRIMARY KEY REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
--     token_hash text NOT NULL UNIQUE,
--     expires_at timestamptz NOT NULL,
--     created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
--     created_at timestamptz NOT NULL DEFAULT now()
-- );
-- INSERT INTO document_links (registration_id, token_hash, expires_at, created_by, created_at)
-- SELECT registration_id, token_hash, expires_at, created_by, created_at FROM registration_links WHERE kind = 'documents';
-- DELETE FROM registration_links WHERE kind = 'documents';
-- ALTER TABLE registration_links DROP CONSTRAINT registration_links_registration_id_kind_key;
-- ALTER TABLE registration_links DROP COLUMN kind;
-- ALTER TABLE registration_links ADD CONSTRAINT registration_form_links_registration_id_key UNIQUE (registration_id);
-- ALTER TABLE registration_links RENAME CONSTRAINT registration_links_pkey TO registration_form_links_pkey;
-- ALTER TABLE registration_links RENAME CONSTRAINT registration_links_token_hash_key TO registration_form_links_token_hash_key;
-- ALTER TABLE registration_links RENAME CONSTRAINT registration_links_registration_id_fkey TO registration_form_links_registration_id_fkey;
-- ALTER TABLE registration_links RENAME CONSTRAINT registration_links_created_by_fkey TO registration_form_links_created_by_fkey;
-- ALTER TABLE registration_links RENAME TO registration_form_links;
-- COMMIT;
