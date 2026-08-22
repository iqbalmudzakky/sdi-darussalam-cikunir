BEGIN;

-- Migration: create table achievements
-- powers the "Prestasi Kami" section on the landing page, previously hardcoded.
CREATE TABLE IF NOT EXISTS achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    emoji text NOT NULL DEFAULT '',
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS achievements;
-- COMMIT;
