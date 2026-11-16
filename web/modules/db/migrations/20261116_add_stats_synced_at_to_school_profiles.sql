BEGIN;

-- Migration: school_profiles.stats_synced_at
-- Kapan angka siswa aktif dan guru & staf terakhir berhasil ditarik dari SSO.
SET LOCAL lock_timeout = '10s';

ALTER TABLE school_profiles
    ADD COLUMN IF NOT EXISTS stats_synced_at timestamptz;

COMMIT;

-- Rollback (jalankan manual, bukan bagian dari migrasi di atas):
-- BEGIN;
-- ALTER TABLE school_profiles DROP COLUMN IF EXISTS stats_synced_at;
-- COMMIT;
