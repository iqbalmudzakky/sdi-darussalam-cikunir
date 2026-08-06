BEGIN;

-- Migration: carry the existing hero photo forward into school_profiles,
-- then drop hero_content. headline/highlight/stat values are NOT carried
-- over — those are now hardcoded directly in components/Hero.tsx instead
-- of being admin-editable (see conversation/decision behind this change).
-- Scalar subquery guarantees exactly one row is inserted into
-- school_profiles even if hero_content ended up empty (photo_url = null).
INSERT INTO school_profiles (photo_url)
VALUES ((SELECT photo_url FROM hero_content WHERE id = 1));

DROP TABLE IF EXISTS hero_content;

COMMIT;

-- Not reversible: hero_content's structure/data is gone. To recreate it,
-- run 20260805_create_hero_content.sql manually.
