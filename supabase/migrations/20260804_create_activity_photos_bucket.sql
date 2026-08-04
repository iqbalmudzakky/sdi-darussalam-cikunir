BEGIN;

-- Migration: create public storage bucket for activity photos + access policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('activity-photos', 'activity-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view activity photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'activity-photos');

CREATE POLICY "Authenticated users can upload activity photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'activity-photos');

CREATE POLICY "Authenticated users can update activity photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'activity-photos')
  WITH CHECK (bucket_id = 'activity-photos');

CREATE POLICY "Authenticated users can delete activity photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'activity-photos');

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete activity photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update activity photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload activity photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view activity photos" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'activity-photos';
-- COMMIT;
