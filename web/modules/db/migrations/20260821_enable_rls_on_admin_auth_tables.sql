BEGIN;

-- Migration: enable RLS on admin_users and refresh_tokens, deny by default
-- These tables hold password hashes and session tokens, so unlike the public
-- content tables, there are NO policies and NO grants to anon/authenticated
-- here on purpose — PostgREST access is fully denied. The app only reads/
-- writes these tables via raw SQL through DATABASE_URL (modules/db/postgres.ts),
-- which connects with its own role and is unaffected by these restrictions.
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE refresh_tokens DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;
-- COMMIT;
