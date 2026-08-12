BEGIN;

-- Migration: create singleton table meta_settings
-- Stores metadata configuration for the public landing page.
-- This is settings-style content, so only one row (id = 1) is allowed.
CREATE TABLE IF NOT EXISTS meta_settings (
    id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),

    meta_title text NOT NULL DEFAULT 'SDI Darussalam Cikunir',
    meta_description text NOT NULL DEFAULT 'Situs resmi SDI Darussalam Cikunir',
    meta_keywords text[] NOT NULL DEFAULT '{}',

    og_title text NOT NULL DEFAULT '',
    og_description text NOT NULL DEFAULT '',
    og_image_url text NOT NULL DEFAULT '',

    twitter_title text NOT NULL DEFAULT '',
    twitter_description text NOT NULL DEFAULT '',
    twitter_image_url text NOT NULL DEFAULT '',

    canonical_url text NOT NULL DEFAULT '',
    robots_index boolean NOT NULL DEFAULT true,
    robots_follow boolean NOT NULL DEFAULT true,

    favicon_url text NOT NULL DEFAULT '',

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure the singleton settings row exists.
INSERT INTO meta_settings (
    id,
    meta_title,
    meta_description
)
VALUES (
    1,
    'SDI Darussalam Cikunir',
    'Situs resmi SDI Darussalam Cikunir'
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS meta_settings;
-- COMMIT;