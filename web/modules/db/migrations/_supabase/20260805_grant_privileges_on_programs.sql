BEGIN;

-- Migration: grant base table privileges on programs
-- RLS policies alone aren't enough — Postgres checks base table GRANTs before
-- RLS policies are even evaluated. "Automatically expose new tables" is off
-- for this project, so this doesn't happen automatically.
GRANT SELECT ON programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON programs TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT ON programs FROM anon, authenticated;
-- REVOKE INSERT, UPDATE, DELETE ON programs FROM authenticated;
-- COMMIT;
