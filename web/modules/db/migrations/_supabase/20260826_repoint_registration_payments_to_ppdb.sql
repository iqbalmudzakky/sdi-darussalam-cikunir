BEGIN;

-- Migration: repoint registration_payments at the new PPDB structure.
--
-- registration_payments was created while registrations was still one flat
-- table. The PPDB restructure replaced it with ppdb_registrations plus its
-- student/parent/detail tables, so the foreign key has to follow — otherwise
-- settling a payment would reference a table the application no longer writes.
--
-- No data migration is needed: at the time of writing the payment flow had not
-- gone live, so registration_id is null on every existing row.
ALTER TABLE registration_payments
    DROP CONSTRAINT IF EXISTS registration_payments_registration_id_fkey;

ALTER TABLE registration_payments
    ADD CONSTRAINT registration_payments_registration_id_fkey
    FOREIGN KEY (registration_id)
    REFERENCES ppdb_registrations (id)
    ON DELETE SET NULL;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE registration_payments
--     DROP CONSTRAINT IF EXISTS registration_payments_registration_id_fkey;
-- ALTER TABLE registration_payments
--     ADD CONSTRAINT registration_payments_registration_id_fkey
--     FOREIGN KEY (registration_id) REFERENCES registrations (id) ON DELETE SET NULL;
-- COMMIT;
