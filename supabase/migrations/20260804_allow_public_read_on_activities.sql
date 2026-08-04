BEGIN;

-- Migration: allow anonymous (public website visitors) to read activities
-- write access stays restricted to authenticated (admin) — see 20260804_enable_rls_on_activities.sql
GRANT SELECT ON activities TO anon;

CREATE POLICY "Public can view activities"
  ON activities FOR SELECT
  TO anon
  USING (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Public can view activities" ON activities;
-- REVOKE SELECT ON activities FROM anon;
-- COMMIT;
