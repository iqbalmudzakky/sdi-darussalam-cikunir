BEGIN;

-- Migration: grant base table privileges on registration_stats
-- Postgres checks base table GRANTs before RLS policies are evaluated, so the
-- policies above need matching grants. No grant to anon on purpose.
GRANT SELECT, INSERT, UPDATE ON registration_stats TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT, INSERT, UPDATE ON registration_stats FROM authenticated;
-- COMMIT;
