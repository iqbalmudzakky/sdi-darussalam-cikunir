BEGIN;

-- Migration: baseline skema PMB saat pindah dari Supabase ke Postgres sendiri.
--
-- Isinya adalah keadaan skema pada 22 September 2026, diambil dengan pg_dump dari
-- Supabase staging. Ia MENGGANTIKAN 70 migrasi lama, yang dipindah ke
-- migrations/_supabase/ sebagai arsip: berkas-berkas itu tidak bisa diputar ulang
-- dari nol (urutan abjadnya tidak sama dengan urutan waktunya, dan tujuh di
-- antaranya menulis ke skema storage.* milik Supabase).
--
-- Yang sengaja TIDAK dibawa:
-- - CREATE POLICY dan ENABLE ROW LEVEL SECURITY. Keduanya menyebut role 'anon' dan
--   'authenticated' yang hanya ada di Supabase. Di sini aplikasi memegang koneksi
--   database sendiri dan penyaringan dilakukan di query repository, bukan oleh RLS.
--   RLS yang menyala tanpa policy justru menolak semua baris tanpa satu pun error.
-- - GRANT ke role Supabase, kepemilikan objek, dan CREATE SCHEMA public.
--
-- Migrasi berikutnya ditulis seperti biasa sebagai berkas baru di folder ini.

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.payment_status AS ENUM (
    'pending',
    'success',
    'failed',
    'expired'
);

--
-- Name: registration_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.registration_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    emoji text DEFAULT ''::text NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    emoji text DEFAULT ''::text NOT NULL,
    badge text DEFAULT ''::text NOT NULL,
    photo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    youtube_url text
);

--
-- Name: admin_action_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_action_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    purpose text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT admin_action_tokens_purpose_check CHECK ((purpose = ANY (ARRAY['invite'::text, 'reset'::text])))
);

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password_hash text,
    role text DEFAULT 'admin'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    CONSTRAINT admin_users_password_required_unless_invited CHECK (((status = 'invited'::text) OR (password_hash IS NOT NULL))),
    CONSTRAINT admin_users_role_check CHECK ((role = ANY (ARRAY['superadmin'::text, 'admin'::text]))),
    CONSTRAINT admin_users_status_check CHECK ((status = ANY (ARRAY['invited'::text, 'active'::text, 'deactivated'::text])))
);

--
-- Name: doku_notification_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doku_notification_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    request_id text NOT NULL,
    invoice_number text,
    transaction_status text,
    body jsonb NOT NULL,
    received_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    summary text DEFAULT ''::text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    poster_url text,
    event_date date NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    published_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT events_slug_check CHECK ((slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'::text))
);

--
-- Name: facilities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.facilities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    subtitle text DEFAULT ''::text NOT NULL,
    emoji text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    photo_url text
);

--
-- Name: payment_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    singleton_guard boolean DEFAULT true NOT NULL,
    registration_fee integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    registration_opens_on date,
    registration_closes_on date,
    CONSTRAINT payment_settings_registration_fee_check CHECK ((registration_fee > 0)),
    CONSTRAINT payment_settings_singleton_guard_check CHECK (singleton_guard),
    CONSTRAINT registration_window_valid_range CHECK (((registration_opens_on IS NULL) OR (registration_closes_on IS NULL) OR (registration_closes_on >= registration_opens_on)))
);

--
-- Name: ppdb_registration_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppdb_registration_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registration_id uuid NOT NULL,
    living_with text,
    distance_to_school text,
    owned_vehicle text,
    transportation_method text,
    talent text,
    blood_type text,
    height integer,
    weight integer,
    head_circumference integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ppdb_registration_details_head_circumference_check CHECK ((head_circumference >= 0)),
    CONSTRAINT ppdb_registration_details_height_check CHECK ((height >= 0)),
    CONSTRAINT ppdb_registration_details_weight_check CHECK ((weight >= 0))
);

--
-- Name: ppdb_registration_parents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppdb_registration_parents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registration_id uuid NOT NULL,
    parent_type text NOT NULL,
    relationship_status text NOT NULL,
    name text NOT NULL,
    nik text NOT NULL,
    place_of_birth text NOT NULL,
    date_of_birth date NOT NULL,
    religion text,
    education text,
    occupation text,
    "position" text,
    income integer,
    citizenship text DEFAULT 'Indonesia'::text,
    phone text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    CONSTRAINT ppdb_registration_parents_income_check CHECK ((income >= 0)),
    CONSTRAINT ppdb_registration_parents_nik_check CHECK ((nik ~ '^[0-9]{16}$'::text)),
    CONSTRAINT ppdb_registration_parents_parent_type_check CHECK ((parent_type = ANY (ARRAY['father'::text, 'mother'::text]))),
    CONSTRAINT ppdb_registration_parents_relationship_status_check CHECK ((relationship_status = ANY (ARRAY['kandung'::text, 'tiri'::text, 'angkat'::text, 'wali'::text])))
);

--
-- Name: ppdb_registration_students; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppdb_registration_students (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registration_id uuid NOT NULL,
    full_name text NOT NULL,
    nickname text,
    nik text NOT NULL,
    nisn text,
    gender text NOT NULL,
    place_of_birth text NOT NULL,
    date_of_birth date NOT NULL,
    address text NOT NULL,
    village text,
    rt_rw text,
    district text,
    city text,
    province text,
    phone text,
    birth_order integer NOT NULL,
    sibling_count integer NOT NULL,
    orphan_status text,
    daily_language text,
    citizenship text DEFAULT 'Indonesia'::text NOT NULL,
    religion text NOT NULL,
    physical_disability text NOT NULL,
    previous_school text NOT NULL,
    previous_school_transfer text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ppdb_registration_students_birth_order_check CHECK ((birth_order >= 1)),
    CONSTRAINT ppdb_registration_students_gender_check CHECK ((gender = ANY (ARRAY['laki_laki'::text, 'perempuan'::text]))),
    CONSTRAINT ppdb_registration_students_nik_check CHECK ((nik ~ '^[0-9]{16}$'::text)),
    CONSTRAINT ppdb_registration_students_physical_disability_check CHECK ((physical_disability = ANY (ARRAY['tidak_ada'::text, 'ada'::text]))),
    CONSTRAINT ppdb_registration_students_sibling_count_check CHECK ((sibling_count >= 0))
);

--
-- Name: ppdb_registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ppdb_registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    registration_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    parent_email text,
    source text DEFAULT 'online'::text NOT NULL,
    academic_year text,
    CONSTRAINT ppdb_registrations_academic_year_format CHECK (((academic_year IS NULL) OR (academic_year ~ '^[0-9]{4}/[0-9]{4}$'::text))),
    CONSTRAINT ppdb_registrations_registration_type_check CHECK ((registration_type = ANY (ARRAY['siswa_baru'::text, 'pindahan'::text]))),
    CONSTRAINT ppdb_registrations_source_check CHECK ((source = ANY (ARRAY['online'::text, 'offline'::text]))),
    CONSTRAINT ppdb_registrations_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'not_registered'::text, 'registered'::text])))
);

--
-- Name: programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    emoji text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

--
-- Name: registration_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registration_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_number text NOT NULL,
    amount integer NOT NULL,
    status public.payment_status DEFAULT 'pending'::public.payment_status NOT NULL,
    payload jsonb NOT NULL,
    registration_id uuid,
    session_id text,
    token_id text,
    payment_url text,
    expired_date text,
    payment_method text,
    acquirer text,
    paid_at timestamp with time zone,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source text DEFAULT 'online'::text NOT NULL,
    receipt_number text,
    CONSTRAINT registration_payments_amount_check CHECK ((amount > 0)),
    CONSTRAINT registration_payments_source_check CHECK ((source = ANY (ARRAY['online'::text, 'manual'::text])))
);

--
-- Name: registration_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registration_stats (
    academic_year text NOT NULL,
    offline_count integer DEFAULT 0 NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT registration_stats_academic_year_check CHECK (
CASE
    WHEN (academic_year ~ '^[0-9]{4}/[0-9]{4}$'::text) THEN ((split_part(academic_year, '/'::text, 2))::integer = ((split_part(academic_year, '/'::text, 1))::integer + 1))
    ELSE false
END),
    CONSTRAINT registration_stats_offline_count_check CHECK ((offline_count >= 0))
);

--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    ip_address text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status public.registration_status DEFAULT 'pending'::public.registration_status NOT NULL,
    registration_type text NOT NULL,
    full_name text NOT NULL,
    gender text NOT NULL,
    place_of_birth text NOT NULL,
    date_of_birth date NOT NULL,
    current_address text NOT NULL,
    physical_disability text NOT NULL,
    previous_school text NOT NULL,
    nisn text,
    father_status text NOT NULL,
    father_name text NOT NULL,
    father_place_of_birth text NOT NULL,
    father_date_of_birth date NOT NULL,
    father_phone text NOT NULL,
    mother_status text NOT NULL,
    mother_name text NOT NULL,
    mother_place_of_birth text NOT NULL,
    mother_date_of_birth date NOT NULL,
    mother_phone text NOT NULL,
    parent_email text NOT NULL,
    student_nik text,
    birth_order integer,
    sibling_count integer,
    father_nik text,
    father_income integer,
    mother_nik text,
    mother_income integer,
    CONSTRAINT registrations_birth_order_check CHECK ((birth_order >= 1)),
    CONSTRAINT registrations_father_income_check CHECK ((father_income >= 0)),
    CONSTRAINT registrations_father_nik_format_check CHECK ((father_nik ~ '^[0-9]{16}$'::text)),
    CONSTRAINT registrations_father_status_check CHECK ((father_status = ANY (ARRAY['kandung'::text, 'tiri'::text, 'angkat'::text, 'wali'::text]))),
    CONSTRAINT registrations_gender_check CHECK ((gender = ANY (ARRAY['laki_laki'::text, 'perempuan'::text]))),
    CONSTRAINT registrations_mother_income_check CHECK ((mother_income >= 0)),
    CONSTRAINT registrations_mother_nik_format_check CHECK ((mother_nik ~ '^[0-9]{16}$'::text)),
    CONSTRAINT registrations_mother_status_check CHECK ((mother_status = ANY (ARRAY['kandung'::text, 'tiri'::text, 'angkat'::text, 'wali'::text]))),
    CONSTRAINT registrations_physical_disability_check CHECK ((physical_disability = ANY (ARRAY['tidak_ada'::text, 'ada'::text]))),
    CONSTRAINT registrations_registration_type_check CHECK ((registration_type = ANY (ARRAY['siswa_baru'::text, 'pindahan'::text]))),
    CONSTRAINT registrations_sibling_count_check CHECK ((sibling_count >= 0)),
    CONSTRAINT registrations_student_nik_format_check CHECK ((student_nik ~ '^[0-9]{16}$'::text))
);

--
-- Name: school_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.school_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    photo_url text,
    description text DEFAULT ''::text NOT NULL,
    visi text DEFAULT ''::text NOT NULL,
    misi text[] DEFAULT '{}'::text[] NOT NULL,
    alamat text DEFAULT ''::text NOT NULL,
    telepon text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    jam_operasional text DEFAULT ''::text NOT NULL,
    facebook text DEFAULT ''::text NOT NULL,
    instagram text DEFAULT ''::text NOT NULL,
    tiktok text DEFAULT ''::text NOT NULL,
    youtube text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    whatsapp text DEFAULT ''::text NOT NULL,
    whatsapp_message text DEFAULT ''::text NOT NULL,
    vision_photo_url text,
    hero_video_url text DEFAULT ''::text NOT NULL,
    active_student_count integer,
    staff_count integer,
    CONSTRAINT school_profiles_active_student_count_check CHECK (((active_student_count IS NULL) OR (active_student_count >= 0))),
    CONSTRAINT school_profiles_staff_count_check CHECK (((staff_count IS NULL) OR (staff_count >= 0)))
);

--
-- Name: site_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_visits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    visitor_hash text NOT NULL,
    duration_ms integer,
    visited_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT site_visits_duration_ms_check CHECK ((duration_ms >= 0))
);

--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);

--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);

--
-- Name: admin_action_tokens admin_action_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_action_tokens
    ADD CONSTRAINT admin_action_tokens_pkey PRIMARY KEY (id);

--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);

--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);

--
-- Name: doku_notification_events doku_notification_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doku_notification_events
    ADD CONSTRAINT doku_notification_events_pkey PRIMARY KEY (id);

--
-- Name: doku_notification_events doku_notification_events_request_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.doku_notification_events
    ADD CONSTRAINT doku_notification_events_request_id_key UNIQUE (request_id);

--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);

--
-- Name: events events_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_slug_key UNIQUE (slug);

--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);

--
-- Name: payment_settings payment_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_pkey PRIMARY KEY (id);

--
-- Name: payment_settings payment_settings_singleton_guard_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_settings
    ADD CONSTRAINT payment_settings_singleton_guard_key UNIQUE (singleton_guard);

--
-- Name: ppdb_registration_details ppdb_registration_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_details
    ADD CONSTRAINT ppdb_registration_details_pkey PRIMARY KEY (id);

--
-- Name: ppdb_registration_details ppdb_registration_details_registration_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_details
    ADD CONSTRAINT ppdb_registration_details_registration_id_key UNIQUE (registration_id);

--
-- Name: ppdb_registration_parents ppdb_registration_parents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_parents
    ADD CONSTRAINT ppdb_registration_parents_pkey PRIMARY KEY (id);

--
-- Name: ppdb_registration_parents ppdb_registration_parents_registration_id_parent_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_parents
    ADD CONSTRAINT ppdb_registration_parents_registration_id_parent_type_key UNIQUE (registration_id, parent_type);

--
-- Name: ppdb_registration_students ppdb_registration_students_nik_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_students
    ADD CONSTRAINT ppdb_registration_students_nik_key UNIQUE (nik);

--
-- Name: ppdb_registration_students ppdb_registration_students_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_students
    ADD CONSTRAINT ppdb_registration_students_pkey PRIMARY KEY (id);

--
-- Name: ppdb_registration_students ppdb_registration_students_registration_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_students
    ADD CONSTRAINT ppdb_registration_students_registration_id_key UNIQUE (registration_id);

--
-- Name: ppdb_registrations ppdb_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registrations
    ADD CONSTRAINT ppdb_registrations_pkey PRIMARY KEY (id);

--
-- Name: programs programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.programs
    ADD CONSTRAINT programs_pkey PRIMARY KEY (id);

--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);

--
-- Name: registration_payments registration_payments_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_payments
    ADD CONSTRAINT registration_payments_invoice_number_key UNIQUE (invoice_number);

--
-- Name: registration_payments registration_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_payments
    ADD CONSTRAINT registration_payments_pkey PRIMARY KEY (id);

--
-- Name: registration_stats registration_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_stats
    ADD CONSTRAINT registration_stats_pkey PRIMARY KEY (academic_year);

--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);

--
-- Name: school_profiles school_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.school_profiles
    ADD CONSTRAINT school_profiles_pkey PRIMARY KEY (id);

--
-- Name: site_visits site_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_visits
    ADD CONSTRAINT site_visits_pkey PRIMARY KEY (id);

--
-- Name: admin_action_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_action_tokens_token_hash_idx ON public.admin_action_tokens USING btree (token_hash);

--
-- Name: admin_action_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_action_tokens_user_id_idx ON public.admin_action_tokens USING btree (user_id);

--
-- Name: doku_notification_events_invoice_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX doku_notification_events_invoice_idx ON public.doku_notification_events USING btree (invoice_number);

--
-- Name: events_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX events_published_idx ON public.events USING btree (is_published, event_date DESC);

--
-- Name: ppdb_registrations_stats_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ppdb_registrations_stats_idx ON public.ppdb_registrations USING btree (academic_year, source);

--
-- Name: refresh_tokens_token_hash_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_token_hash_idx ON public.refresh_tokens USING btree (token_hash);

--
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);

--
-- Name: registration_payments_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX registration_payments_created_at_idx ON public.registration_payments USING btree (created_at DESC);

--
-- Name: registration_payments_source_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX registration_payments_source_idx ON public.registration_payments USING btree (source);

--
-- Name: registration_payments_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX registration_payments_status_idx ON public.registration_payments USING btree (status);

--
-- Name: registration_stats_one_current_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX registration_stats_one_current_idx ON public.registration_stats USING btree (is_current) WHERE is_current;

--
-- Name: site_visits_visited_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_visits_visited_at_idx ON public.site_visits USING btree (visited_at DESC);

--
-- Name: site_visits_visitor_hash_visited_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX site_visits_visitor_hash_visited_at_idx ON public.site_visits USING btree (visitor_hash, visited_at);

--
-- Name: admin_action_tokens admin_action_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_action_tokens
    ADD CONSTRAINT admin_action_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;

--
-- Name: ppdb_registration_details ppdb_registration_details_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_details
    ADD CONSTRAINT ppdb_registration_details_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.ppdb_registrations(id) ON DELETE CASCADE;

--
-- Name: ppdb_registration_parents ppdb_registration_parents_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_parents
    ADD CONSTRAINT ppdb_registration_parents_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.ppdb_registrations(id) ON DELETE CASCADE;

--
-- Name: ppdb_registration_students ppdb_registration_students_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ppdb_registration_students
    ADD CONSTRAINT ppdb_registration_students_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.ppdb_registrations(id) ON DELETE CASCADE;

--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.admin_users(id) ON DELETE CASCADE;

--
-- Name: registration_payments registration_payments_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registration_payments
    ADD CONSTRAINT registration_payments_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.ppdb_registrations(id) ON DELETE SET NULL;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- Baseline tidak punya rollback: membatalkannya berarti mengosongkan seluruh
-- database. Buat database baru dan jalankan ulang bila perlu mengulang.
