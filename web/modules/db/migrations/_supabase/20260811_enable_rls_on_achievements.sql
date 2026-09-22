BEGIN;

-- Migration: enable RLS on achievements
-- read is public (public website displays achievements), write is authenticated-only (admin CMS)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view achievements"
  ON achievements FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert achievements"
  ON achievements FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update achievements"
  ON achievements FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete achievements"
  ON achievements FOR DELETE
  TO authenticated
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete achievements" ON achievements;
-- DROP POLICY IF EXISTS "Authenticated users can update achievements" ON achievements;
-- DROP POLICY IF EXISTS "Authenticated users can insert achievements" ON achievements;
-- DROP POLICY IF EXISTS "Public can view achievements" ON achievements;
-- ALTER TABLE achievements DISABLE ROW LEVEL SECURITY;
-- COMMIT;
