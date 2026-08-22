-- One-time bootstrap script for a FRESH production database.
--
-- This is NOT part of the migrations/ history and is not meant to be run
-- against staging (staging already has this state, built up incrementally
-- via migrations/). This file consolidates that history into the current
-- final schema, skipping tables/buckets that were created then later
-- reverted on staging (hero_content, meta_settings, hero-photos bucket) so
-- production never ends up with dead objects.
--
-- Run this ONCE against a brand new Supabase project's DATABASE_URL.
-- Every migration added to migrations/ from now on must ALSO be replayed
-- against production separately (this file is not updated after the fact).

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    emoji text NOT NULL DEFAULT '',
    badge text NOT NULL DEFAULT '',
    photo_url text,
    youtube_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE facilities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    subtitle text NOT NULL DEFAULT '',
    emoji text NOT NULL DEFAULT '',
    photo_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE programs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    emoji text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE school_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_url text,
    description text NOT NULL DEFAULT '',
    visi text NOT NULL DEFAULT '',
    misi text[] NOT NULL DEFAULT '{}',
    alamat text NOT NULL DEFAULT '',
    telepon text NOT NULL DEFAULT '',
    whatsapp text NOT NULL DEFAULT '',
    whatsapp_message text NOT NULL DEFAULT '',
    email text NOT NULL DEFAULT '',
    jam_operasional text NOT NULL DEFAULT '',
    facebook text NOT NULL DEFAULT '',
    instagram text NOT NULL DEFAULT '',
    tiktok text NOT NULL DEFAULT '',
    youtube text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE registration_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_name text NOT NULL,
    student_name text NOT NULL,
    whatsapp text NOT NULL,
    email text NOT NULL,
    message text NOT NULL DEFAULT '',
    ip_address text,
    status registration_status NOT NULL DEFAULT 'pending',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE achievements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    emoji text NOT NULL DEFAULT '',
    title text NOT NULL,
    description text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    role text NOT NULL DEFAULT 'admin' CHECK (role IN ('superadmin', 'admin')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens(user_id);
CREATE INDEX refresh_tokens_token_hash_idx ON refresh_tokens(token_hash);

-- ============================================================
-- RLS + policies + grants
-- ============================================================

ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON activities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON activities TO authenticated;
CREATE POLICY "Public can view activities" ON activities FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert activities" ON activities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update activities" ON activities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete activities" ON activities FOR DELETE TO authenticated USING (true);

ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON facilities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON facilities TO authenticated;
CREATE POLICY "Public can view facilities" ON facilities FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert facilities" ON facilities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update facilities" ON facilities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete facilities" ON facilities FOR DELETE TO authenticated USING (true);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON programs TO authenticated;
CREATE POLICY "Public can view programs" ON programs FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert programs" ON programs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update programs" ON programs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete programs" ON programs FOR DELETE TO authenticated USING (true);

ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON school_profiles TO anon, authenticated;
GRANT UPDATE ON school_profiles TO authenticated;
CREATE POLICY "Public can view school profiles" ON school_profiles FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can update school profiles" ON school_profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
GRANT SELECT, DELETE ON registrations TO authenticated;
CREATE POLICY "Authenticated users can view registrations" ON registrations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete registrations" ON registrations FOR DELETE TO authenticated USING (true);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON achievements TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON achievements TO authenticated;
CREATE POLICY "Public can view achievements" ON achievements FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated users can insert achievements" ON achievements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update achievements" ON achievements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete achievements" ON achievements FOR DELETE TO authenticated USING (true);

-- admin_users / refresh_tokens: RLS enabled, deliberately NO policies/grants.
-- App only touches these via the raw DATABASE_URL connection (modules/db/postgres.ts).
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Seed data
-- ============================================================

-- school_profiles needs exactly one row for getSchoolProfile() to find.
-- Commented out because the real row is being migrated from staging via
-- DBeaver Data Transfer instead — uncomment this ONLY if you're not
-- migrating existing school_profiles data.
-- INSERT INTO school_profiles DEFAULT VALUES;

-- Superadmin seed — REPLACE the placeholders below before running.
-- Generate the hash locally first, e.g.:
--   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YOUR_PASSWORD', 12));"
-- Do NOT reuse the staging superadmin's email/password here.
INSERT INTO admin_users (email, password_hash, role)
VALUES (
    'sutoyomim7012@gmail.com',
    '$2b$12$7/4guB//N2a2FCP0EK.Gt.3eicqNEu.v4BGIKDMrFbf9gYiUP3ZaC',
    'superadmin'
);

COMMIT;

-- ============================================================
-- Storage buckets + policies (run separately — Supabase Storage
-- tables can't be modified in the same way as regular SQL from
-- some clients; if this errors in your SQL editor, create buckets
-- via Storage dashboard instead and just run the policy statements)
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('activity-photos', 'activity-photos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public can view activity photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'activity-photos');
CREATE POLICY "Authenticated users can upload activity photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'activity-photos');
CREATE POLICY "Authenticated users can update activity photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'activity-photos') WITH CHECK (bucket_id = 'activity-photos');
CREATE POLICY "Authenticated users can delete activity photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'activity-photos');

INSERT INTO storage.buckets (id, name, public) VALUES ('facility-photos', 'facility-photos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public can view facility photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'facility-photos');
CREATE POLICY "Authenticated users can upload facility photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'facility-photos');
CREATE POLICY "Authenticated users can update facility photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'facility-photos') WITH CHECK (bucket_id = 'facility-photos');
CREATE POLICY "Authenticated users can delete facility photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'facility-photos');

INSERT INTO storage.buckets (id, name, public) VALUES ('school-profile-photos', 'school-profile-photos', true) ON CONFLICT (id) DO NOTHING;
CREATE POLICY "Public can view school profile photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'school-profile-photos');
CREATE POLICY "Authenticated users can upload school profile photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'school-profile-photos');
CREATE POLICY "Authenticated users can update school profile photos" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'school-profile-photos') WITH CHECK (bucket_id = 'school-profile-photos');
CREATE POLICY "Authenticated users can delete school profile photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'school-profile-photos');
