BEGIN;

-- Migration: add student identity, family order, and parent income fields
-- to the detailed PPDB registration form.
--
-- All newly added fields are required for new registrations.

ALTER TABLE registrations
    ADD COLUMN student_nik text NOT NULL,
    ADD COLUMN birth_order integer NOT NULL,
    ADD COLUMN sibling_count integer NOT NULL,
    ADD COLUMN father_nik text NOT NULL,
    ADD COLUMN father_income integer NOT NULL,
    ADD COLUMN mother_nik text NOT NULL,
    ADD COLUMN mother_income integer NOT NULL;

ALTER TABLE registrations
    ADD CONSTRAINT registrations_student_nik_format_check
        CHECK (student_nik ~ '^[0-9]{16}$'),
    ADD CONSTRAINT registrations_birth_order_check
        CHECK (birth_order >= 1),
    ADD CONSTRAINT registrations_sibling_count_check
        CHECK (sibling_count >= 0),
    ADD CONSTRAINT registrations_father_nik_format_check
        CHECK (father_nik ~ '^[0-9]{16}$'),
    ADD CONSTRAINT registrations_father_income_check
        CHECK (father_income >= 0),
    ADD CONSTRAINT registrations_mother_nik_format_check
        CHECK (mother_nik ~ '^[0-9]{16}$'),
    ADD CONSTRAINT registrations_mother_income_check
        CHECK (mother_income >= 0);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
--
-- BEGIN;
--
-- ALTER TABLE registrations
--     DROP CONSTRAINT registrations_student_nik_format_check,
--     DROP CONSTRAINT registrations_birth_order_check,
--     DROP CONSTRAINT registrations_sibling_count_check,
--     DROP CONSTRAINT registrations_father_nik_format_check,
--     DROP CONSTRAINT registrations_father_income_check,
--     DROP CONSTRAINT registrations_mother_nik_format_check,
--     DROP CONSTRAINT registrations_mother_income_check;
--
-- ALTER TABLE registrations
--     DROP COLUMN student_nik,
--     DROP COLUMN birth_order,
--     DROP COLUMN sibling_count,
--     DROP COLUMN father_nik,
--     DROP COLUMN father_income,
--     DROP COLUMN mother_nik,
--     DROP COLUMN mother_income;
--
-- COMMIT;