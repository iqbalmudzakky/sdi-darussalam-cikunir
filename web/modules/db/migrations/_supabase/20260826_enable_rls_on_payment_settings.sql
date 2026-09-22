BEGIN;

-- Migration: enable RLS on payment_settings
-- No policy for anon: the fee is only ever read server-side when creating a
-- DOKU session, so the public never needs to query it directly. Admins read
-- and update it through the dashboard; insert and delete stay closed because
-- the table is a singleton seeded by its own migration.
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payment settings"
  ON payment_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update payment settings"
  ON payment_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can update payment settings" ON payment_settings;
-- DROP POLICY IF EXISTS "Authenticated users can view payment settings" ON payment_settings;
-- ALTER TABLE payment_settings DISABLE ROW LEVEL SECURITY;
-- COMMIT;
