BEGIN;

-- Migration: add youtube_url to activities
-- optional YouTube video link for a kegiatan. When set, the public card
-- shows the YouTube thumbnail instead of photo_url and links out to the
-- video on click.
ALTER TABLE activities
    ADD COLUMN IF NOT EXISTS youtube_url text;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE activities DROP COLUMN IF EXISTS youtube_url;
-- COMMIT;
