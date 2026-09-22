BEGIN;

-- Migration: add vision_photo_url to school_profiles
-- Powers the fixed-background image behind the "Visi & Misi" section on the
-- landing page. Kept separate from `photo_url` (the hero/building photo) so
-- both sections can use different images. Files live in the existing
-- 'school-profile-photos' bucket — no new bucket or policies needed.
-- Nullable on purpose: when empty the section falls back to a solid colour.
ALTER TABLE school_profiles
    ADD COLUMN IF NOT EXISTS vision_photo_url text;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE school_profiles DROP COLUMN IF EXISTS vision_photo_url;
-- COMMIT;
