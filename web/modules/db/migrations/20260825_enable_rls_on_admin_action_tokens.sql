BEGIN;

-- Migration: enable RLS on admin_action_tokens, deny by default
-- Same rationale as 20260821_enable_rls_on_admin_auth_tables.sql — no
-- policies/grants, app only accesses this table via raw SQL through
-- DATABASE_URL.
ALTER TABLE admin_action_tokens ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE admin_action_tokens DISABLE ROW LEVEL SECURITY;
-- COMMIT;
