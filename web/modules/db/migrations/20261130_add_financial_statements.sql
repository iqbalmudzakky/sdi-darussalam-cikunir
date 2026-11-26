BEGIN;

-- Migration: surat pernyataan mampu membayar (PRD F15, K38, 11.2.3)
-- Isi surat adalah salinan (jsonb): diambil dari biodata & Pengaturan PMB saat pertama dibuat, setelah itu
-- hanya berubah lewat form surat atau tombol "Gunakan Update Terbaru".
SET LOCAL lock_timeout = '10s';

CREATE TABLE IF NOT EXISTS financial_statements (
    registration_id uuid PRIMARY KEY REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    content jsonb NOT NULL,
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- DROP TABLE IF EXISTS financial_statements;
-- COMMIT;
