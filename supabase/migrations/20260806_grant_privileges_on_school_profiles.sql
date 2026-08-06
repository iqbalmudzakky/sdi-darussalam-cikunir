BEGIN;

-- Migration: grant base table privileges on school_profiles
-- RLS policies alone aren't enough — Postgres checks base table GRANTs
-- before RLS policies are even evaluated. "Automatically expose new
-- tables" is off for this project, so this doesn't happen automatically.
GRANT SELECT ON school_profiles TO anon, authenticated;
GRANT UPDATE ON school_profiles TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT ON school_profiles FROM anon, authenticated;
-- REVOKE UPDATE ON school_profiles FROM authenticated;
-- COMMIT;
