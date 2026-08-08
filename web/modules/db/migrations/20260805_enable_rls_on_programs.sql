BEGIN;

-- Migration: enable RLS on programs
-- read is public (public website displays programs), write is authenticated-only (admin CMS)
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view programs"
  ON programs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert programs"
  ON programs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update programs"
  ON programs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete programs"
  ON programs FOR DELETE
  TO authenticated
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete programs" ON programs;
-- DROP POLICY IF EXISTS "Authenticated users can update programs" ON programs;
-- DROP POLICY IF EXISTS "Authenticated users can insert programs" ON programs;
-- DROP POLICY IF EXISTS "Public can view programs" ON programs;
-- ALTER TABLE programs DISABLE ROW LEVEL SECURITY;
-- COMMIT;
