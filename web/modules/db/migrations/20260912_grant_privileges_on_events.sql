BEGIN;

-- Migration: grant base table privileges on events
-- RLS policies alone aren't enough — Postgres checks base table GRANTs before
-- RLS policies are even evaluated. "Automatically expose new tables" is off
-- for this project, so this doesn't happen automatically.
GRANT SELECT ON events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON events TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT ON events FROM anon, authenticated;
-- REVOKE INSERT, UPDATE, DELETE ON events FROM authenticated;
-- COMMIT;
