BEGIN;

-- Migration: record offline payments alongside the online ones.
--
-- Pendaftaran lewat formulir kertas dibayar tunai di sekolah, di luar DOKU.
-- Sebelum ini pembayaran tersebut tidak punya jejak apa pun di sistem: baris
-- pendaftaran ada, tapi tidak ada catatan bahwa uangnya sudah masuk. Dua kolom
-- ini membuat pembayaran offline bisa dicatat di tabel yang sama, sehingga
-- halaman Transaksi menjadi satu-satunya buku besar pembayaran.

-- Membedakan pembayaran yang lahir dari DOKU dengan yang dicatat admin.
-- Penting untuk rekonsiliasi: hanya baris 'online' yang punya padanan di
-- dashboard DOKU, jadi pengecekan pembayaran nyangkut tidak boleh menyentuh
-- baris 'manual'.
ALTER TABLE registration_payments
    ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'online';

-- Nomor kwitansi fisik yang diberikan sekolah, untuk mencocokkan dengan arsip
-- kertas kalau ada sengketa. Selalu kosong untuk pembayaran online.
ALTER TABLE registration_payments
    ADD COLUMN IF NOT EXISTS receipt_number text;

ALTER TABLE registration_payments
    DROP CONSTRAINT IF EXISTS registration_payments_source_check;

ALTER TABLE registration_payments
    ADD CONSTRAINT registration_payments_source_check
    CHECK (source IN ('online', 'manual'));

CREATE INDEX IF NOT EXISTS registration_payments_source_idx
    ON registration_payments (source);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP INDEX IF EXISTS registration_payments_source_idx;
-- ALTER TABLE registration_payments
--     DROP CONSTRAINT IF EXISTS registration_payments_source_check;
-- ALTER TABLE registration_payments DROP COLUMN IF EXISTS receipt_number;
-- ALTER TABLE registration_payments DROP COLUMN IF EXISTS source;
-- COMMIT;
