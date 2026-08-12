BEGIN;

-- Migration: enable RLS on meta_settings
-- Landing page metadata is public-readable.
-- Changes to metadata are restricted to authenticated users.
ALTER TABLE meta_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view meta settings"
  ON meta_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update meta settings"
  ON meta_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can update meta settings"
--   ON meta_settings;
-- DROP POLICY IF EXISTS "Public can view meta settings"
--   ON meta_settings;
-- ALTER TABLE meta_settings DISABLE ROW LEVEL SECURITY;
-- COMMIT;