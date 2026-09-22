BEGIN;

-- Migration: create table events
-- Rumah tetap untuk poster kegiatan yang selama ini hanya disebar lewat status
-- WhatsApp dan hilang dalam 24 jam.
--
-- slug dipakai di URL publik dan sengaja terpisah dari title: begitu tautannya
-- tersebar, mengubah judul tidak boleh mematikan tautan yang sudah dikirim.
--
-- category dibiarkan teks bebas, mengikuti activities.badge — sekolah membuat
-- jenis kegiatan baru tiap tahun, dan daftar tertutup berarti setiap kegiatan
-- baru menunggu migrasi.
CREATE TABLE IF NOT EXISTS events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    slug text NOT NULL UNIQUE
        CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

    title text NOT NULL,
    category text NOT NULL DEFAULT '',
    summary text NOT NULL DEFAULT '',
    body text NOT NULL DEFAULT '',

    poster_url text,

    -- Tanggal peristiwa, bukan tanggal input. Ini yang menentukan urutan tampil.
    event_date date NOT NULL,

    is_published boolean NOT NULL DEFAULT false,
    published_at timestamptz,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS events_published_idx
    ON events (is_published, event_date DESC);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS events;
-- COMMIT;
