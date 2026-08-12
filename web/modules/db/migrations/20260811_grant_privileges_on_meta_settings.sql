BEGIN;

-- Migration: grant base table privileges on meta_settings
-- Public visitors may read landing-page metadata.
-- Only authenticated users may update it.
GRANT SELECT ON meta_settings TO anon, authenticated;
GRANT UPDATE ON meta_settings TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT ON meta_settings FROM anon, authenticated;
-- REVOKE UPDATE ON meta_settings FROM authenticated;
-- COMMIT;