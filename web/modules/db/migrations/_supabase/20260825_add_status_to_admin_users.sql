BEGIN;

-- Migration: add status to admin_users, make password_hash nullable
-- An invited-but-not-yet-activated admin has no password yet. status
-- distinguishes invited/active/deactivated; the existing seeded superadmin
-- row backfills to 'active' via the column default.
ALTER TABLE admin_users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE admin_users
    ADD COLUMN status text NOT NULL DEFAULT 'active'
        CHECK (status IN ('invited', 'active', 'deactivated'));

ALTER TABLE admin_users
    ADD CONSTRAINT admin_users_password_required_unless_invited
        CHECK (status = 'invited' OR password_hash IS NOT NULL);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- ALTER TABLE admin_users DROP CONSTRAINT admin_users_password_required_unless_invited;
-- ALTER TABLE admin_users DROP COLUMN status;
-- ALTER TABLE admin_users ALTER COLUMN password_hash SET NOT NULL;
-- COMMIT;
