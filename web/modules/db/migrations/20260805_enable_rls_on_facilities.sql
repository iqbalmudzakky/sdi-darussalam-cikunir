BEGIN;

-- Migration: enable RLS on facilities
-- read is public (public website displays facilities), write is authenticated-only (admin CMS)
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view facilities"
  ON facilities FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert facilities"
  ON facilities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update facilities"
  ON facilities FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete facilities"
  ON facilities FOR DELETE
  TO authenticated
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete facilities" ON facilities;
-- DROP POLICY IF EXISTS "Authenticated users can update facilities" ON facilities;
-- DROP POLICY IF EXISTS "Authenticated users can insert facilities" ON facilities;
-- DROP POLICY IF EXISTS "Public can view facilities" ON facilities;
-- ALTER TABLE facilities DISABLE ROW LEVEL SECURITY;
-- COMMIT;
