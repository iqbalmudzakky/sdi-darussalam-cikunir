import { sql } from "@/modules/db/postgres";
import type {
  AdminActionToken,
  AdminActionTokenPurpose,
  CountActionTokensInput,
  NewAdminActionToken,
} from "./entity";

export async function insertActionToken(
  input: NewAdminActionToken,
): Promise<AdminActionToken> {
  const rows = await sql.unsafe<AdminActionToken[]>(
    `INSERT INTO admin_action_tokens (user_id, purpose, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, purpose, token_hash, expires_at, used_at, created_at`,
    [input.user_id, input.purpose, input.token_hash, input.expires_at],
  );
  return rows[0];
}

export async function findActionTokenByHash(
  tokenHash: string,
  purpose: AdminActionTokenPurpose,
): Promise<AdminActionToken | null> {
  const rows = await sql.unsafe<AdminActionToken[]>(
    `SELECT id, user_id, purpose, token_hash, expires_at, used_at, created_at
     FROM admin_action_tokens WHERE token_hash = $1 AND purpose = $2`,
    [tokenHash, purpose],
  );
  return rows[0] ?? null;
}

export async function markActionTokenUsed(id: string): Promise<void> {
  await sql.unsafe(
    `UPDATE admin_action_tokens SET used_at = now() WHERE id = $1`,
    [id],
  );
}

export async function invalidateActiveActionTokens(
  userId: string,
  purpose: AdminActionTokenPurpose,
): Promise<void> {
  await sql.unsafe(
    `UPDATE admin_action_tokens SET used_at = now()
     WHERE user_id = $1 AND purpose = $2 AND used_at IS NULL`,
    [userId, purpose],
  );
}

export async function countRecentActionTokens(
  input: CountActionTokensInput,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM admin_action_tokens
     WHERE user_id = $1 AND purpose = $2
       AND created_at > now() - ($3 || ' minutes')::interval`,
    [input.userId, input.purpose, input.windowMinutes],
  );
  return rows[0].count;
}

export async function deleteStaleActionTokens(): Promise<number> {
  const result = await sql.unsafe(
    `DELETE FROM admin_action_tokens
     WHERE expires_at < now()
        OR (used_at IS NOT NULL AND used_at < now() - interval '30 days')`,
  );
  return result.count;
}
