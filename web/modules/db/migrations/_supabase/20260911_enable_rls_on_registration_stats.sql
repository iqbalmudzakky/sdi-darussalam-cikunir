BEGIN;

-- Migration: enable RLS on registration_stats
-- Tanpa policy untuk anon: angka publik dihitung di server, jadi publik tidak
-- perlu membaca tabel ini langsung. Tanpa DELETE supaya angka tahun lalu tidak
-- bisa hilang.
ALTER TABLE registration_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view registration stats"
  ON registration_stats FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert registration stats"
  ON registration_stats FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update registration stats"
  ON registration_stats FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can update registration stats" ON registration_stats;
-- DROP POLICY IF EXISTS "Authenticated users can insert registration stats" ON registration_stats;
-- DROP POLICY IF EXISTS "Authenticated users can view registration stats" ON registration_stats;
-- ALTER TABLE registration_stats DISABLE ROW LEVEL SECURITY;
-- COMMIT;
