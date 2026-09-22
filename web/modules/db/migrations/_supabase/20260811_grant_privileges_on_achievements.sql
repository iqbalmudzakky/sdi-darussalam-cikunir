BEGIN;

-- Migration: grant base table privileges on achievements
-- RLS policies alone aren't enough — Postgres checks base table GRANTs before
-- RLS policies are even evaluated. "Automatically expose new tables" is off
-- for this project, so this doesn't happen automatically.
GRANT SELECT ON achievements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON achievements TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT ON achievements FROM anon, authenticated;
-- REVOKE INSERT, UPDATE, DELETE ON achievements FROM authenticated;
-- COMMIT;
