BEGIN;

-- Migration: biaya pendaftaran per pendaftar (PRD F12, K12, 11.4) + email pengingat H-1 (F11)
-- Pembayaran kini selalu terhubung ke pendaftar yang sudah ada: ditandai lunas oleh panitia
-- (tunai/transfer) atau dibayar lewat link DOKU. payload cukup berisi potongan data pendaftar
-- (nama, NIK, email, WA kontak) supaya halaman Transaksi tetap bisa menampilkan dan mencari.
-- Lunas manual yang salah klik bisa dibatalkan (status cancelled), tercatat siapa dan kapan.
SET LOCAL lock_timeout = '10s';

ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'cancelled';

ALTER TABLE registration_payments
    ADD COLUMN IF NOT EXISTS recorded_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cancelled_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS cancelled_at timestamptz;

ALTER TABLE admission_tests
    ADD COLUMN IF NOT EXISTS email_reminded_at timestamptz;

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- ALTER TABLE admission_tests DROP COLUMN IF EXISTS email_reminded_at;
-- ALTER TABLE registration_payments
--     DROP COLUMN IF EXISTS cancelled_at,
--     DROP COLUMN IF EXISTS cancelled_by,
--     DROP COLUMN IF EXISTS recorded_by;
-- Nilai enum 'cancelled' tidak bisa dihapus tanpa membuat ulang tipe; biarkan.
-- COMMIT;
