BEGIN;

-- Migration: create public storage bucket for event posters + access policies
INSERT INTO storage.buckets (id, name, public)
VALUES ('event-photos', 'event-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view event photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'event-photos');

CREATE POLICY "Authenticated users can upload event photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'event-photos');

CREATE POLICY "Authenticated users can update event photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'event-photos')
  WITH CHECK (bucket_id = 'event-photos');

CREATE POLICY "Authenticated users can delete event photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'event-photos');

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete event photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update event photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload event photos" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view event photos" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'event-photos';
-- COMMIT;
