BEGIN;

-- Migration: grant base table privileges on registrations
-- RLS policies alone aren't enough — Postgres checks base table GRANTs
-- before RLS policies are even evaluated. No grant to anon on purpose —
-- see 20260808_enable_rls_on_registrations.sql for why.
GRANT SELECT, DELETE ON registrations TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT, DELETE ON registrations FROM authenticated;
-- COMMIT;
