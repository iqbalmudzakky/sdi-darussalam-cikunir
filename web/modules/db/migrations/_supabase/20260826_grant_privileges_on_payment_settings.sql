BEGIN;

-- Migration: grant base table privileges on payment_settings
-- Postgres checks base table GRANTs before RLS policies are evaluated, so the
-- policies above need matching grants. No grant to anon on purpose.
GRANT SELECT, UPDATE ON payment_settings TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT, UPDATE ON payment_settings FROM authenticated;
-- COMMIT;
