BEGIN;

-- Migration: enable RLS on activities, restrict all access to authenticated users only
-- (this is an admin-only CMS table — public site doesn't read from it yet)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete activities"
  ON activities FOR DELETE
  TO authenticated
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete activities" ON activities;
-- DROP POLICY IF EXISTS "Authenticated users can update activities" ON activities;
-- DROP POLICY IF EXISTS "Authenticated users can insert activities" ON activities;
-- DROP POLICY IF EXISTS "Authenticated users can view activities" ON activities;
-- ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
-- COMMIT;
