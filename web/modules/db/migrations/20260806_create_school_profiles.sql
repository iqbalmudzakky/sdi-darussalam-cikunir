BEGIN;

-- Migration: create table school_profiles
-- represents "1 school unit". Multi-row capable on purpose (a future
-- school unit can be added as another row) — but for now there's no FK
-- from other content tables (activities/programs/etc) to a specific
-- profile row; the app just reads the first/only row. Wiring that up is
-- deferred until multi-unit support is actually needed.
CREATE TABLE IF NOT EXISTS school_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_url text,
    description text NOT NULL DEFAULT '',
    visi text NOT NULL DEFAULT '',
    misi text[] NOT NULL DEFAULT '{}',
    alamat text NOT NULL DEFAULT '',
    telepon text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    jam_operasional text NOT NULL DEFAULT '',
    facebook text NOT NULL DEFAULT '',
    instagram text NOT NULL DEFAULT '',
    tiktok text NOT NULL DEFAULT '',
    youtube text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS school_profiles;
-- COMMIT;
