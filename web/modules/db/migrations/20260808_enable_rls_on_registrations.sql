BEGIN;

-- Migration: enable RLS on registrations
-- no policy at all for anon — the public submission form does NOT write
-- to this table directly with the anon key. Instead, POST /api/registrations
-- runs server-side using the Supabase service role key, which bypasses RLS,
-- so it can run the honeypot/rate-limit/duplicate checks (which need to
-- read recent rows) before inserting. This also means nobody can insert or
-- read registrant data by calling Supabase's REST API directly with the
-- public anon key — every public write is forced through our own
-- validation logic.
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view registrations"
  ON registrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete registrations"
  ON registrations FOR DELETE
  TO authenticated
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete registrations" ON registrations;
-- DROP POLICY IF EXISTS "Authenticated users can view registrations" ON registrations;
-- ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;
-- COMMIT;
