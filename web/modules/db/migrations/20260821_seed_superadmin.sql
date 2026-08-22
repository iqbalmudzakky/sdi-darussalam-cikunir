BEGIN;

-- Migration: seed first superadmin account
-- Password hash generated locally with bcryptjs (cost 12), plaintext was
-- never written to any file. This is the existing admin's account, migrated
-- off Supabase Auth as the first superadmin of the new custom auth system.
INSERT INTO admin_users (email, password_hash, role)
VALUES (
    'sutoyomim7012@gmail.com',
    '$2b$12$1ihEivbSMCaOOgIhm6YdEutf118JvXc0OVquXLU8RN294xhcjHL3K',
    'superadmin'
)
ON CONFLICT (email) DO NOTHING;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DELETE FROM admin_users WHERE email = 'sutoyomim7012@gmail.com';
-- COMMIT;
