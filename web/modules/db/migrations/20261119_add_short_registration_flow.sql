BEGIN;

-- Migration: alur pendaftaran baru (PRD 11.3, 11.5.1, K3, K19, K26, K29)
-- Form pendek membuat baris pendaftar lebih dulu, jadi data siswa boleh belum lengkap.
-- CHECK status sementara masih menerima nilai lama untuk container lama; nilai lama dibuang di PR 6.
SET LOCAL lock_timeout = '10s';

ALTER TABLE ppdb_registrations
    ADD COLUMN IF NOT EXISTS registration_number text,
    ADD COLUMN IF NOT EXISTS program text,
    ADD COLUMN IF NOT EXISTS target_grade smallint,
    ADD COLUMN IF NOT EXISTS contact_name text,
    ADD COLUMN IF NOT EXISTS contact_phone text,
    ADD COLUMN IF NOT EXISTS full_form_completed_at timestamptz,
    ADD COLUMN IF NOT EXISTS received_documents text[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS status_before_cancel text;

ALTER TABLE ppdb_registrations DROP CONSTRAINT ppdb_registrations_status_check;

ALTER TABLE ppdb_registrations
    ADD CONSTRAINT ppdb_registrations_status_check CHECK (status IN (
        'new',
        'scheduled',
        'tested',
        'accepted',
        'rejected',
        'cancelled',
        'pending',
        'in_progress',
        'not_registered',
        'registered'
    )),
    ADD CONSTRAINT ppdb_registrations_program_check
        CHECK (program IS NULL OR program IN ('tahfizh', 'unggulan')),
    ADD CONSTRAINT ppdb_registrations_target_grade_check
        CHECK (target_grade IS NULL OR target_grade BETWEEN 2 AND 6);

ALTER TABLE ppdb_registrations ALTER COLUMN status SET DEFAULT 'new';

UPDATE ppdb_registrations pr
SET contact_name = parent.name,
    contact_phone = parent.phone
FROM (
    SELECT DISTINCT ON (registration_id) registration_id, name, phone
    FROM ppdb_registration_parents
    ORDER BY registration_id, (parent_type = 'father') DESC
) parent
WHERE parent.registration_id = pr.id;

UPDATE ppdb_registrations
SET full_form_completed_at = created_at,
    status_before_cancel = CASE WHEN status = 'not_registered' THEN 'new' END,
    status = CASE status
        WHEN 'pending' THEN 'new'
        WHEN 'in_progress' THEN 'new'
        WHEN 'registered' THEN 'accepted'
        WHEN 'not_registered' THEN 'cancelled'
        ELSE status
    END;

WITH numbered AS (
    SELECT
        id,
        academic_year,
        row_number() OVER (PARTITION BY academic_year ORDER BY created_at, id) AS sequence
    FROM ppdb_registrations
    WHERE academic_year IS NOT NULL
)
UPDATE ppdb_registrations pr
SET registration_number = substr(numbered.academic_year, 3, 2)
    || substr(numbered.academic_year, 8, 2)
    || '-'
    || lpad(numbered.sequence::text, 3, '0')
FROM numbered
WHERE numbered.id = pr.id;

ALTER TABLE ppdb_registrations
    ADD CONSTRAINT ppdb_registrations_registration_number_key UNIQUE (registration_number);

ALTER TABLE ppdb_registration_students
    ALTER COLUMN nik DROP NOT NULL,
    ALTER COLUMN place_of_birth DROP NOT NULL,
    ALTER COLUMN address DROP NOT NULL,
    ALTER COLUMN birth_order DROP NOT NULL,
    ALTER COLUMN sibling_count DROP NOT NULL,
    ALTER COLUMN religion DROP NOT NULL,
    ALTER COLUMN physical_disability DROP NOT NULL;

COMMIT;

-- Rollback (jalankan manual, bukan bagian dari migrasi di atas):
-- BEGIN;
-- DELETE FROM ppdb_registrations WHERE full_form_completed_at IS NULL;
-- UPDATE ppdb_registrations SET status = CASE status
--     WHEN 'new' THEN 'pending'
--     WHEN 'cancelled' THEN 'not_registered'
--     ELSE 'registered'
-- END;
-- ALTER TABLE ppdb_registrations ALTER COLUMN status SET DEFAULT 'pending';
-- ALTER TABLE ppdb_registrations DROP CONSTRAINT ppdb_registrations_status_check;
-- ALTER TABLE ppdb_registrations ADD CONSTRAINT ppdb_registrations_status_check
--     CHECK (status IN ('pending', 'in_progress', 'not_registered', 'registered'));
-- ALTER TABLE ppdb_registrations
--     DROP CONSTRAINT ppdb_registrations_registration_number_key,
--     DROP CONSTRAINT ppdb_registrations_program_check,
--     DROP CONSTRAINT ppdb_registrations_target_grade_check,
--     DROP COLUMN registration_number,
--     DROP COLUMN program,
--     DROP COLUMN target_grade,
--     DROP COLUMN contact_name,
--     DROP COLUMN contact_phone,
--     DROP COLUMN full_form_completed_at,
--     DROP COLUMN received_documents,
--     DROP COLUMN status_before_cancel;
-- COMMIT;
