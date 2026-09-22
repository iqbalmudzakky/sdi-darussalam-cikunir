BEGIN;

-- Migration: grant base table privileges on hero_content
-- RLS policies alone aren't enough — Postgres checks base table GRANTs before
-- RLS policies are even evaluated. "Automatically expose new tables" is off
-- for this project, so this doesn't happen automatically.
GRANT SELECT ON hero_content TO anon, authenticated;
GRANT INSERT, UPDATE ON hero_content TO authenticated;

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- REVOKE SELECT ON hero_content FROM anon, authenticated;
-- REVOKE INSERT, UPDATE ON hero_content FROM authenticated;
-- COMMIT;
