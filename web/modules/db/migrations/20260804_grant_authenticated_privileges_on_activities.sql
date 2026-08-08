BEGIN;

-- Migration: grant base table privileges to authenticated role on activities
-- RLS policies alone aren't enough — Postgres checks base table GRANTs before
-- RLS policies are even evaluated. "Automatically expose new tables" was
-- intentionally left off when the project was created, so this never got
-- granted automatically.
GRANT SELECT, INSERT, UPDATE, DELETE ON activities TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT, INSERT, UPDATE, DELETE ON activities FROM authenticated;
-- COMMIT;
