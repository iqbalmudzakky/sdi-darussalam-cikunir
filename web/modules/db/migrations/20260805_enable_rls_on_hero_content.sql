BEGIN;

-- Migration: enable RLS on hero_content
-- read is public, write (insert+update, no delete) is authenticated-only.
-- insert is needed because the first row (id=1) is created via upsert
-- from the admin UI, not seeded — see lib/data/hero.ts.
ALTER TABLE hero_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hero content"
  ON hero_content FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert hero content"
  ON hero_content FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update hero content"
  ON hero_content FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can update hero content" ON hero_content;
-- DROP POLICY IF EXISTS "Authenticated users can insert hero content" ON hero_content;
-- DROP POLICY IF EXISTS "Public can view hero content" ON hero_content;
-- ALTER TABLE hero_content DISABLE ROW LEVEL SECURITY;
-- COMMIT;
