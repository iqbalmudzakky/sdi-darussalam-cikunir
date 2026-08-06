BEGIN;

-- Migration: create public storage bucket for facility photos + access policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('facility-photos', 'facility-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view facility photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'facility-photos');

CREATE POLICY "Authenticated users can upload facility photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'facility-photos');

CREATE POLICY "Authenticated users can update facility photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'facility-photos')
  WITH CHECK (bucket_id = 'facility-photos');

CREATE POLICY "Authenticated users can delete facility photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'facility-photos');

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete facility photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update facility photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload facility photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view facility photos" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'facility-photos';
-- COMMIT;
