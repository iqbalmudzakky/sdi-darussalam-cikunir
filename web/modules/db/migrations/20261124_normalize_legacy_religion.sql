BEGIN;

-- Migration: agama pendaftar form lama tersimpan "Islam" (huruf besar), form baru memakai
-- kode huruf kecil ("islam"). Disamakan supaya terbaca di form Ubah data.
SET LOCAL lock_timeout = '10s';

UPDATE ppdb_registration_students
SET religion = lower(religion)
WHERE religion IS NOT NULL
  AND religion <> lower(religion);

COMMIT;
