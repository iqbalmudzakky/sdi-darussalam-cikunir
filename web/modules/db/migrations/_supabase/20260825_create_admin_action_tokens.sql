BEGIN;

-- Migration: create table admin_action_tokens
-- Shared one-time-token table for both invite-acceptance and forgot-password
-- flows. token_hash stores a hash of the opaque token value, never the raw
-- value, same rationale as refresh_tokens.
CREATE TABLE IF NOT EXISTS admin_action_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    purpose text NOT NULL CHECK (purpose IN ('invite', 'reset')),
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_action_tokens_user_id_idx ON admin_action_tokens(user_id);
CREATE INDEX IF NOT EXISTS admin_action_tokens_token_hash_idx ON admin_action_tokens(token_hash);

COMMIT;

-- Rollback (run manually, not part of the up migration above):
-- BEGIN;
-- DROP TABLE IF EXISTS admin_action_tokens;
-- COMMIT;
