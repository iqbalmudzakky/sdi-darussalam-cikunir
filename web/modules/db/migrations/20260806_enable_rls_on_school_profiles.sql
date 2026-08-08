BEGIN;

-- Migration: enable RLS on school_profiles
-- read is public (Beranda/Tentang/Kontak all read from this), write
-- (update only, no insert/delete yet) is authenticated-only. Insert isn't
-- opened up because there's exactly one row today, created by the
-- migration itself — a second row only becomes relevant once multi-unit
-- support is actually built.
ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view school profiles"
  ON school_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can update school profiles"
  ON school_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can update school profiles" ON school_profiles;
-- DROP POLICY IF EXISTS "Public can view school profiles" ON school_profiles;
-- ALTER TABLE school_profiles DISABLE ROW LEVEL SECURITY;
-- COMMIT;
