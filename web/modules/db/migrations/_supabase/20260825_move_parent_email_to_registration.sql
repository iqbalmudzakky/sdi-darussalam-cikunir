BEGIN;

-- Move parent email from parent table to registration table.

ALTER TABLE ppdb_registrations
ADD COLUMN IF NOT EXISTS parent_email text;

ALTER TABLE ppdb_registration_parents
DROP COLUMN IF EXISTS email;

COMMIT;

-- Rollback manual:
-- BEGIN;
-- ALTER TABLE ppdb_registration_parents
-- ADD COLUMN IF NOT EXISTS email text;
--
-- ALTER TABLE ppdb_registrations
-- DROP COLUMN IF EXISTS parent_email;
-- COMMIT;