BEGIN;

-- Migration: create table payment_settings
-- Holds the registration fee so it can be changed from the admin dashboard
-- instead of a redeploy. Exactly one row: the singleton_guard column is fixed
-- to true and unique, so a second row cannot be inserted by accident and the
-- app never has to guess which row is authoritative.
--
-- registration_fee is what the applicant is charged, and must cover DOKU's MDR
-- on top of the school's own fee — DOKU deducts it from the amount received,
-- and Checkout fixes the amount before the applicant picks a method. See
-- modules/payment/config.ts for the rates behind the default.
CREATE TABLE IF NOT EXISTS payment_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    singleton_guard boolean NOT NULL DEFAULT true UNIQUE
        CHECK (singleton_guard),

    registration_fee integer NOT NULL CHECK (registration_fee > 0),

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed the single row with the amount the app charged before this change, so
-- the behaviour is identical until an admin edits it.
INSERT INTO payment_settings (registration_fee)
VALUES (155000)
ON CONFLICT (singleton_guard) DO NOTHING;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS payment_settings;
-- COMMIT;
