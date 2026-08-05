BEGIN;

-- Migration: create singleton table hero_content
-- only ever one row (id=1) — this is settings-style content, not a list.
-- only the fields that are realistically edited by the school are stored
-- here; button labels, stat labels, and the badge text stay hardcoded in
-- the component since they're part of the page's structure/design.
CREATE TABLE IF NOT EXISTS hero_content (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    headline_main text NOT NULL DEFAULT '',
    headline_highlight text NOT NULL DEFAULT '',
    description text NOT NULL DEFAULT '',
    stat1_value text NOT NULL DEFAULT '',
    stat2_value text NOT NULL DEFAULT '',
    stat3_value text NOT NULL DEFAULT '',
    photo_url text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS hero_content;
-- COMMIT;
