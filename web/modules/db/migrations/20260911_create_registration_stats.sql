BEGIN;

-- Migration: create table registration_stats
-- Menyimpan jumlah pendaftar offline yang belum diinput satu per satu ke sistem,
-- satu baris per tahun ajaran. Angka online tidak disimpan di sini — ia selalu
-- dihitung dari ppdb_registrations supaya tidak pernah basi.
--
-- is_current menandai tahun ajaran yang angkanya tampil di landing page. Hanya
-- boleh ada satu, dan itu dijaga index di bawah: dua tahun aktif membuat angka
-- publik salah tanpa memunculkan error apa pun.
CREATE TABLE IF NOT EXISTS registration_stats (
    -- CASE, bukan AND: Postgres tidak menjamin urutan AND, dan cast ::int pada
    -- teks yang formatnya salah akan error sebelum CHECK sempat menolaknya.
    academic_year text PRIMARY KEY
        CHECK (
            CASE
                WHEN academic_year ~ '^[0-9]{4}/[0-9]{4}$'
                THEN split_part(academic_year, '/', 2)::int
                     = split_part(academic_year, '/', 1)::int + 1
                ELSE false
            END
        ),

    offline_count integer NOT NULL DEFAULT 0
        CHECK (offline_count >= 0),

    is_current boolean NOT NULL DEFAULT false,

    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS registration_stats_one_current_idx
    ON registration_stats (is_current)
    WHERE is_current;

-- Tahun ajaran yang sedang dibuka pendaftarannya, sama dengan label di hero.
INSERT INTO registration_stats (academic_year, offline_count, is_current)
VALUES ('2027/2028', 0, true)
ON CONFLICT (academic_year) DO NOTHING;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS registration_stats;
-- COMMIT;
