BEGIN;

-- Migration: form lengkap lewat link (PRD 11.5.1, 11.5.2, F9, K30-K33)
-- Isian mengikuti sheet FORM BIODATA sekolah: orang tua cukup tahun lahir dan rentang
-- penghasilan, ada data wali dan prestasi. Kolom lama dibiarkan untuk data pendaftar lama.
-- Link form lengkap disimpan sebagai hash; satu pendaftar satu link, kirim ulang menimpa
-- link lama sehingga link lama tidak berlaku.
SET LOCAL lock_timeout = '10s';

ALTER TABLE ppdb_registration_students
    ADD COLUMN IF NOT EXISTS hamlet text,
    ADD COLUMN IF NOT EXISTS postal_code text,
    ADD COLUMN IF NOT EXISTS home_phone text,
    ADD COLUMN IF NOT EXISTS previous_school_npsn text,
    ADD COLUMN IF NOT EXISTS previous_school_address text,
    ADD COLUMN IF NOT EXISTS birth_certificate_number text,
    ADD COLUMN IF NOT EXISTS kks_number text,
    ADD COLUMN IF NOT EXISTS kps_number text,
    ADD COLUMN IF NOT EXISTS kip_number text,
    ADD COLUMN IF NOT EXISTS kip_name text,
    ADD COLUMN IF NOT EXISTS latitude numeric(9, 6),
    ADD COLUMN IF NOT EXISTS longitude numeric(9, 6);

ALTER TABLE ppdb_registration_details
    ADD COLUMN IF NOT EXISTS travel_time_minutes integer CHECK (travel_time_minutes >= 0);

ALTER TABLE ppdb_registration_parents
    ADD COLUMN IF NOT EXISTS birth_year smallint,
    ADD COLUMN IF NOT EXISTS special_needs text,
    ADD COLUMN IF NOT EXISTS income_range text;

ALTER TABLE ppdb_registration_parents
    ALTER COLUMN relationship_status DROP NOT NULL,
    ALTER COLUMN nik DROP NOT NULL,
    ALTER COLUMN place_of_birth DROP NOT NULL,
    ALTER COLUMN date_of_birth DROP NOT NULL,
    ALTER COLUMN phone DROP NOT NULL;

ALTER TABLE ppdb_registration_parents DROP CONSTRAINT ppdb_registration_parents_parent_type_check;

ALTER TABLE ppdb_registration_parents
    ADD CONSTRAINT ppdb_registration_parents_parent_type_check
    CHECK (parent_type IN ('father', 'mother', 'guardian'));

CREATE TABLE IF NOT EXISTS ppdb_registration_achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    category text NOT NULL,
    level text NOT NULL,
    name text NOT NULL,
    year smallint NOT NULL,
    organizer text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ppdb_registration_achievements_registration_id_idx
    ON ppdb_registration_achievements (registration_id);

CREATE TABLE IF NOT EXISTS registration_form_links (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id uuid NOT NULL UNIQUE REFERENCES ppdb_registrations(id) ON DELETE CASCADE,
    token_hash text NOT NULL UNIQUE,
    expires_at timestamptz NOT NULL,
    created_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- DROP TABLE IF EXISTS registration_form_links;
-- DROP TABLE IF EXISTS ppdb_registration_achievements;
-- DELETE FROM ppdb_registration_parents WHERE parent_type = 'guardian';
-- ALTER TABLE ppdb_registration_parents DROP CONSTRAINT ppdb_registration_parents_parent_type_check;
-- ALTER TABLE ppdb_registration_parents ADD CONSTRAINT ppdb_registration_parents_parent_type_check
--     CHECK (parent_type IN ('father', 'mother'));
-- ALTER TABLE ppdb_registration_parents
--     DROP COLUMN IF EXISTS birth_year,
--     DROP COLUMN IF EXISTS special_needs,
--     DROP COLUMN IF EXISTS income_range;
-- ALTER TABLE ppdb_registration_details DROP COLUMN IF EXISTS travel_time_minutes;
-- ALTER TABLE ppdb_registration_students
--     DROP COLUMN IF EXISTS hamlet, DROP COLUMN IF EXISTS postal_code, DROP COLUMN IF EXISTS home_phone,
--     DROP COLUMN IF EXISTS previous_school_npsn, DROP COLUMN IF EXISTS previous_school_address,
--     DROP COLUMN IF EXISTS birth_certificate_number, DROP COLUMN IF EXISTS kks_number,
--     DROP COLUMN IF EXISTS kps_number, DROP COLUMN IF EXISTS kip_number, DROP COLUMN IF EXISTS kip_name,
--     DROP COLUMN IF EXISTS latitude, DROP COLUMN IF EXISTS longitude;
-- COMMIT;
