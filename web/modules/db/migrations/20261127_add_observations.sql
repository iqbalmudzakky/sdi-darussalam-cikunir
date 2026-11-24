BEGIN;

-- Migration: observasi kesiapan PMB (PRD F13) dan hasil tes pindahan (F14), tabel 11.5.2
-- Skor 56 indikator tersimpan otomatis tiap pindah dimensi. completed_at terisi saat
-- "Simpan observasi". Profil Kesiapan tidak disimpan: dihitung ulang di service dari skor.
-- Hasil tes pindahan menempel di jadwal tesnya (admission_tests).
SET LOCAL lock_timeout = '10s';

CREATE TABLE IF NOT EXISTS observations (
    registration_id uuid PRIMARY KEY REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    observer_id uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    observed_on date NOT NULL,
    note text,
    recommendation text,
    completed_at timestamptz,
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS observation_scores (
    registration_id uuid NOT NULL REFERENCES observations(registration_id) ON DELETE CASCADE,
    indicator smallint NOT NULL CHECK (indicator BETWEEN 1 AND 56),
    score smallint NOT NULL CHECK (score BETWEEN 1 AND 4),
    note text,
    PRIMARY KEY (registration_id, indicator)
);

ALTER TABLE admission_tests
    ADD COLUMN IF NOT EXISTS manual_tested_on date,
    ADD COLUMN IF NOT EXISTS manual_notes text,
    ADD COLUMN IF NOT EXISTS manual_recorded_by uuid REFERENCES admin_users(id) ON DELETE SET NULL;

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- ALTER TABLE admission_tests
--     DROP COLUMN IF EXISTS manual_recorded_by,
--     DROP COLUMN IF EXISTS manual_notes,
--     DROP COLUMN IF EXISTS manual_tested_on;
-- DROP TABLE IF EXISTS observation_scores;
-- DROP TABLE IF EXISTS observations;
-- COMMIT;
