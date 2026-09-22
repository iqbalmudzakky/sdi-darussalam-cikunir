BEGIN;

-- Migration:
-- Create new PPDB registration structure.
--
-- This separates online registration data from future
-- student master data.

CREATE TABLE IF NOT EXISTS ppdb_registrations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    registration_type text NOT NULL
        CHECK (
            registration_type IN (
                'siswa_baru',
                'pindahan'
            )
        ),

    status text NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'in_progress',
                'not_registered',
                'registered'
            )
        ),

    ip_address text,

    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS ppdb_registration_students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    registration_id uuid NOT NULL UNIQUE
        REFERENCES ppdb_registrations(id)
        ON DELETE CASCADE,


    full_name text NOT NULL,

    nickname text,

    nik text NOT NULL
        CHECK (nik ~ '^[0-9]{16}$'),

    nisn text,

    gender text NOT NULL
        CHECK (
            gender IN (
                'laki_laki',
                'perempuan'
            )
        ),


    place_of_birth text NOT NULL,

    date_of_birth date NOT NULL,


    address text NOT NULL,

    village text,

    rt_rw text,

    district text,

    city text,

    province text,


    phone text,


    birth_order integer NOT NULL
        CHECK (birth_order >= 1),

    sibling_count integer NOT NULL
        CHECK (sibling_count >= 0),


    orphan_status text,


    daily_language text,

    citizenship text NOT NULL DEFAULT 'Indonesia',

    religion text NOT NULL,


    physical_disability text NOT NULL
        CHECK (
            physical_disability IN (
                'tidak_ada',
                'ada'
            )
        ),


    previous_school text NOT NULL,

    previous_school_transfer text,


    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now()
);


CREATE TABLE IF NOT EXISTS ppdb_registration_parents (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    registration_id uuid NOT NULL
        REFERENCES ppdb_registrations(id)
        ON DELETE CASCADE,


    parent_type text NOT NULL
        CHECK (
            parent_type IN (
                'father',
                'mother'
            )
        ),


    relationship_status text NOT NULL
        CHECK (
            relationship_status IN (
                'kandung',
                'tiri',
                'angkat',
                'wali'
            )
        ),


    name text NOT NULL,

    nik text NOT NULL
        CHECK (nik ~ '^[0-9]{16}$'),


    place_of_birth text NOT NULL,

    date_of_birth date NOT NULL,


    religion text,

    education text,


    occupation text,

    position text,


    income integer
        CHECK (income >= 0),


    citizenship text DEFAULT 'Indonesia',

    phone text NOT NULL,


    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now(),


    UNIQUE(registration_id, parent_type)
);



CREATE TABLE IF NOT EXISTS ppdb_registration_details (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    registration_id uuid NOT NULL UNIQUE
        REFERENCES ppdb_registrations(id)
        ON DELETE CASCADE,


    living_with text,

    distance_to_school text,

    owned_vehicle text,

    transportation_method text,


    talent text,


    blood_type text,


    height integer
        CHECK (height >= 0),

    weight integer
        CHECK (weight >= 0),

    head_circumference integer
        CHECK (head_circumference >= 0),


    created_at timestamptz NOT NULL DEFAULT now(),

    updated_at timestamptz NOT NULL DEFAULT now()
);


COMMIT;