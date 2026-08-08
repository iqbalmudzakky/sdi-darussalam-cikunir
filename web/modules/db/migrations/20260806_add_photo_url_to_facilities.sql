BEGIN;

-- Migration: add photo_url to facilities
-- public card design moves from emoji icon to a background photo; emoji
-- and subtitle columns are kept (still editable in admin) but are no
-- longer rendered on the public card.
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS photo_url text;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE facilities DROP COLUMN IF EXISTS photo_url;
-- COMMIT;
