BEGIN;

-- Migration: enable RLS on events
-- read is public (public website displays published events), write is
-- authenticated-only (admin CMS). Draft filtering (is_published) happens in
-- the repository query, not here — RLS only gates the table, not the row.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete events" ON events;
-- DROP POLICY IF EXISTS "Authenticated users can update events" ON events;
-- DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;
-- DROP POLICY IF EXISTS "Public can view events" ON events;
-- ALTER TABLE events DISABLE ROW LEVEL SECURITY;
-- COMMIT;
