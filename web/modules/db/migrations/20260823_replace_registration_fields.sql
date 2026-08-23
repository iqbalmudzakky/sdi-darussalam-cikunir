BEGIN;

-- Migration: replace registrations columns with detailed PPDB-style fields
-- Old contact-form-style fields (parent_name, student_name, whatsapp, email,
-- message) are replaced with full student/father/mother biodata matching the
-- school's official Google Form. Existing rows are expected to have already
-- been cleared manually via the admin UI before this runs.
ALTER TABLE registrations
    DROP COLUMN parent_name,
    DROP COLUMN student_name,
    DROP COLUMN whatsapp,
    DROP COLUMN email,
    DROP COLUMN message;

ALTER TABLE registrations
    ADD COLUMN registration_type text NOT NULL
        CHECK (registration_type IN ('siswa_baru', 'pindahan')),
    ADD COLUMN full_name text NOT NULL,
    ADD COLUMN gender text NOT NULL
        CHECK (gender IN ('laki_laki', 'perempuan')),
    ADD COLUMN place_of_birth text NOT NULL,
    ADD COLUMN date_of_birth date NOT NULL,
    ADD COLUMN current_address text NOT NULL,
    ADD COLUMN physical_disability text NOT NULL
        CHECK (physical_disability IN ('tidak_ada', 'ada')),
    ADD COLUMN previous_school text NOT NULL,
    ADD COLUMN nisn text,
    ADD COLUMN father_status text NOT NULL
        CHECK (father_status IN ('kandung', 'tiri', 'angkat', 'wali')),
    ADD COLUMN father_name text NOT NULL,
    ADD COLUMN father_place_of_birth text NOT NULL,
    ADD COLUMN father_date_of_birth date NOT NULL,
    ADD COLUMN father_phone text NOT NULL,
    ADD COLUMN mother_status text NOT NULL
        CHECK (mother_status IN ('kandung', 'tiri', 'angkat', 'wali')),
    ADD COLUMN mother_name text NOT NULL,
    ADD COLUMN mother_place_of_birth text NOT NULL,
    ADD COLUMN mother_date_of_birth date NOT NULL,
    ADD COLUMN mother_phone text NOT NULL,
    ADD COLUMN parent_email text NOT NULL;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE registrations
--     DROP COLUMN registration_type,
--     DROP COLUMN full_name,
--     DROP COLUMN gender,
--     DROP COLUMN place_of_birth,
--     DROP COLUMN date_of_birth,
--     DROP COLUMN current_address,
--     DROP COLUMN physical_disability,
--     DROP COLUMN previous_school,
--     DROP COLUMN nisn,
--     DROP COLUMN father_status,
--     DROP COLUMN father_name,
--     DROP COLUMN father_place_of_birth,
--     DROP COLUMN father_date_of_birth,
--     DROP COLUMN father_phone,
--     DROP COLUMN mother_status,
--     DROP COLUMN mother_name,
--     DROP COLUMN mother_place_of_birth,
--     DROP COLUMN mother_date_of_birth,
--     DROP COLUMN mother_phone,
--     DROP COLUMN parent_email;
-- ALTER TABLE registrations
--     ADD COLUMN parent_name text NOT NULL DEFAULT '',
--     ADD COLUMN student_name text NOT NULL DEFAULT '',
--     ADD COLUMN whatsapp text NOT NULL DEFAULT '',
--     ADD COLUMN email text NOT NULL DEFAULT '',
--     ADD COLUMN message text NOT NULL DEFAULT '';
-- COMMIT;
