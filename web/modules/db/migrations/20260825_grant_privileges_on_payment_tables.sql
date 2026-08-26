BEGIN;

-- Migration: grant base table privileges on the payment tables
-- Postgres checks base table GRANTs before RLS policies are evaluated, so the
-- SELECT policy above needs a matching grant. No grant to anon on purpose.
GRANT SELECT ON registration_payments TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT ON registration_payments FROM authenticated;
-- COMMIT;
