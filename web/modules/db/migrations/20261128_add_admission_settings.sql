BEGIN;

-- Migration: Pengaturan PMB (PRD F18, K15, K20)
-- Satu baris: biaya masuk per program, diskon asal TK, batas bayar, rekening, penanda tangan,
-- CP PMB (WA setelah form pendek) dan CP di Surat Diterima. Nominal awal diambil dari Excel
-- sekolah; CP PMB diisi nomor WhatsApp Profil Sekolah supaya perilaku tidak berubah.
-- Nama penanda tangan dan CP surat dikosongkan, diisi kepsek/wakepsek dari halaman.
SET LOCAL lock_timeout = '10s';

CREATE TABLE IF NOT EXISTS admission_settings (
    singleton_guard boolean PRIMARY KEY DEFAULT true CHECK (singleton_guard),
    tahfizh_yearly_fee integer NOT NULL CHECK (tahfizh_yearly_fee >= 0),
    tahfizh_july_fee integer NOT NULL CHECK (tahfizh_july_fee >= 0),
    unggulan_yearly_fee integer NOT NULL CHECK (unggulan_yearly_fee >= 0),
    unggulan_july_fee integer NOT NULL CHECK (unggulan_july_fee >= 0),
    darussalam_discount integer NOT NULL CHECK (darussalam_discount >= 0),
    other_discount integer NOT NULL CHECK (other_discount >= 0),
    payment_deadline date,
    bank_name text NOT NULL DEFAULT '',
    bank_account_number text NOT NULL DEFAULT '',
    bank_account_name text NOT NULL DEFAULT '',
    principal_name text NOT NULL DEFAULT '',
    committee_chair_name text NOT NULL DEFAULT '',
    director_name text NOT NULL DEFAULT '',
    pmb_contact_phone text NOT NULL DEFAULT '',
    letter_contacts jsonb NOT NULL DEFAULT '[]'::jsonb,
    updated_by uuid REFERENCES admin_users(id) ON DELETE SET NULL,
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO admission_settings (
    tahfizh_yearly_fee, tahfizh_july_fee, unggulan_yearly_fee, unggulan_july_fee,
    darussalam_discount, other_discount, bank_name, bank_account_number,
    bank_account_name, pmb_contact_phone
)
VALUES (
    27900000, 1870000, 27700000, 1870000, 2700000, 1500000,
    'Bank Muamalat Indonesia Cab. Kalimalang', '305.000.3310', 'Perguruan Islam Darussalam',
    COALESCE((SELECT whatsapp FROM school_profiles LIMIT 1), '')
)
ON CONFLICT (singleton_guard) DO NOTHING;

COMMIT;

-- Rollback (jalankan manual, bukan bagian migrasi naik):
-- BEGIN;
-- DROP TABLE IF EXISTS admission_settings;
-- COMMIT;
