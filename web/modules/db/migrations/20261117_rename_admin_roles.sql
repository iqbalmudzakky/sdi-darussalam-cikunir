BEGIN;

-- Migration: admin_users.role memakai 5 peran baru (PRD 11.4)
-- superadmin -> principal, admin -> teacher. CHECK sementara masih menerima nilai lama
-- supaya container lama yang masih jalan beberapa detik tidak gagal menulis; nilai lama
-- dibuang di PR 6 (PRD 11.7).
SET LOCAL lock_timeout = '10s';

ALTER TABLE admin_users DROP CONSTRAINT admin_users_role_check;

ALTER TABLE admin_users
    ADD CONSTRAINT admin_users_role_check CHECK (role IN (
        'principal',
        'vice_principal',
        'administration_staff',
        'teacher',
        'developer',
        'superadmin',
        'admin'
    ));

UPDATE admin_users SET role = 'principal' WHERE role = 'superadmin';
UPDATE admin_users SET role = 'teacher' WHERE role = 'admin';

ALTER TABLE admin_users ALTER COLUMN role SET DEFAULT 'teacher';

COMMIT;

-- Rollback (jalankan manual, bukan bagian dari migrasi di atas):
-- BEGIN;
-- UPDATE admin_users SET role = 'superadmin' WHERE role IN ('principal', 'developer');
-- UPDATE admin_users SET role = 'admin' WHERE role IN ('vice_principal', 'administration_staff', 'teacher');
-- ALTER TABLE admin_users ALTER COLUMN role SET DEFAULT 'admin';
-- ALTER TABLE admin_users DROP CONSTRAINT admin_users_role_check;
-- ALTER TABLE admin_users ADD CONSTRAINT admin_users_role_check CHECK (role IN ('superadmin', 'admin'));
-- COMMIT;
