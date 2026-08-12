BEGIN;

-- Migration: create public storage bucket for landing-page metadata assets
-- Stores Open Graph, Twitter/social card, and favicon images.
INSERT INTO storage.buckets (id, name, public)
VALUES ('meta-assets', 'meta-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view meta assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'meta-assets');

CREATE POLICY "Authenticated users can upload meta assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'meta-assets');

CREATE POLICY "Authenticated users can update meta assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'meta-assets')
  WITH CHECK (bucket_id = 'meta-assets');

CREATE POLICY "Authenticated users can delete meta assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'meta-assets');

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP POLICY IF EXISTS "Authenticated users can delete meta assets"
--   ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can update meta assets"
--   ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload meta assets"
--   ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view meta assets"
--   ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'meta-assets';
-- COMMIT;