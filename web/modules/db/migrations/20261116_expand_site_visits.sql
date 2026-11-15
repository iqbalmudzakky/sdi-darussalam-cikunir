BEGIN;

-- Migration: rincian kunjungan di site_visits
-- Sebelumnya satu baris hanya berisi sidik harian dan lama kunjungan, jadi
-- dashboard tidak bisa menjawab dari mana pengunjung datang, halaman apa yang
-- dibuka, atau apakah ia pernah datang sebelumnya. Kolom di bawah meniru
-- pencatatan landing page Mimtera: satu baris per halaman yang dibuka, dengan
-- asal kedatangan, perkiraan lokasi, dan perangkat.
--
-- Alamat IP kini DISIMPAN supaya pengunjung yang kembali di hari lain tetap
-- dikenali (mengikuti halaman Pengunjung Mimtera, 16 November 2026). Baris
-- dihapus cron cleanup-tokens setelah 400 hari.
--
-- Semua kolom baru boleh kosong atau punya nilai bawaan, sehingga versi lama
-- aplikasi yang masih berjalan saat deploy tetap bisa menulis.
ALTER TABLE site_visits
    ADD COLUMN IF NOT EXISTS day date,
    ADD COLUMN IF NOT EXISTS ip_address text,
    ADD COLUMN IF NOT EXISTS path text NOT NULL DEFAULT '/',
    ADD COLUMN IF NOT EXISTS referrer_host text,
    ADD COLUMN IF NOT EXISTS utm_source text,
    ADD COLUMN IF NOT EXISTS country_code text,
    ADD COLUMN IF NOT EXISTS province text,
    ADD COLUMN IF NOT EXISTS city text,
    ADD COLUMN IF NOT EXISTS device text,
    ADD COLUMN IF NOT EXISTS os text,
    ADD COLUMN IF NOT EXISTS browser text,
    ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- Baris lama: tanggal WIB dari waktu kunjungan, terakhir terlihat dari lamanya.
UPDATE site_visits
   SET day = (visited_at AT TIME ZONE 'Asia/Jakarta')::date
 WHERE day IS NULL;

UPDATE site_visits
   SET last_seen_at = visited_at + make_interval(secs => COALESCE(duration_ms, 0) / 1000.0)
 WHERE last_seen_at IS NULL;

ALTER TABLE site_visits
    ALTER COLUMN day SET DEFAULT ((now() AT TIME ZONE 'Asia/Jakarta')::date),
    ALTER COLUMN day SET NOT NULL,
    ALTER COLUMN last_seen_at SET DEFAULT now(),
    ALTER COLUMN last_seen_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS site_visits_day_visitor_hash_idx
    ON site_visits (day, visitor_hash);

COMMIT;

-- Rollback (jalankan manual, bukan bagian dari migrasi di atas):
-- BEGIN;
-- DROP INDEX IF EXISTS site_visits_day_visitor_hash_idx;
-- ALTER TABLE site_visits
--     DROP COLUMN IF EXISTS day,
--     DROP COLUMN IF EXISTS ip_address,
--     DROP COLUMN IF EXISTS path,
--     DROP COLUMN IF EXISTS referrer_host,
--     DROP COLUMN IF EXISTS utm_source,
--     DROP COLUMN IF EXISTS country_code,
--     DROP COLUMN IF EXISTS province,
--     DROP COLUMN IF EXISTS city,
--     DROP COLUMN IF EXISTS device,
--     DROP COLUMN IF EXISTS os,
--     DROP COLUMN IF EXISTS browser,
--     DROP COLUMN IF EXISTS last_seen_at;
-- COMMIT;
