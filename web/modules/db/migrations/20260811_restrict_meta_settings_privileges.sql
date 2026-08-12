BEGIN;

-- Migration: restrict privileges on meta_settings
-- The landing page may read metadata publicly.
-- Only authenticated users may update metadata.
-- Remove any broader privileges inherited/applied when the table was created.

REVOKE ALL PRIVILEGES
ON TABLE meta_settings
FROM anon, authenticated;

GRANT SELECT
ON TABLE meta_settings
TO anon, authenticated;

GRANT UPDATE
ON TABLE meta_settings
TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE ALL PRIVILEGES ON TABLE meta_settings FROM anon, authenticated;
-- COMMIT;