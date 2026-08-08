BEGIN;

-- Migration: create public storage bucket for school profile photo uploads
-- + access policies. The legacy 'hero-photos' bucket is left untouched —
-- the photo carried over from hero_content still resolves from there.
INSERT INTO storage.buckets (id, name, public)
VALUES ('school-profile-photos', 'school-profile-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view school profile photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'school-profile-photos');

CREATE POLICY "Authenticated users can upload school profile photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'school-profile-photos');

CREATE POLICY "Authenticated users can update school profile photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'school-profile-photos')
  WITH CHECK (bucket_id = 'school-profile-photos');

CREATE POLICY "Authenticated users can delete school profile photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'school-profile-photos');

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete school profile photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update school profile photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload school profile photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view school profile photos" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'school-profile-photos';
-- COMMIT;
