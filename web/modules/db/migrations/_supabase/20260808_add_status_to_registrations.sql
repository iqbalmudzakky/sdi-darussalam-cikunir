BEGIN;

-- Migration: add follow-up status to registrations
-- tracks admin follow-up progress per pendaftar: pending (default)
-- -> in_progress -> completed. Indonesian labels are handled in the UI only.
CREATE TYPE registration_status AS ENUM ('pending', 'in_progress', 'completed');

ALTER TABLE registrations
    ADD COLUMN IF NOT EXISTS status registration_status NOT NULL DEFAULT 'pending';

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE registrations DROP COLUMN IF EXISTS status;
-- DROP TYPE IF EXISTS registration_status;
-- COMMIT;
