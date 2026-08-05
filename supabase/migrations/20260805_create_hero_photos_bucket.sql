BEGIN;

-- Migration: create public storage bucket for hero photo + access policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero-photos', 'hero-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view hero photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'hero-photos');

CREATE POLICY "Authenticated users can upload hero photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'hero-photos');

CREATE POLICY "Authenticated users can update hero photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'hero-photos')
  WITH CHECK (bucket_id = 'hero-photos');

CREATE POLICY "Authenticated users can delete hero photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'hero-photos');

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete hero photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update hero photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload hero photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view hero photos" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'hero-photos';
-- COMMIT;
