import { sql } from "@/modules/db/postgres";
import type {
  AdminActionToken,
  AdminActionTokenPurpose,
  AdminCredentials,
  AdminPatch,
  AdminSummary,
  NewAdminActionToken,
  NewInvitedAdmin,
  NewRefreshToken,
  RefreshToken,
} from "./entity";

export async function findByEmail(
  email: string,
): Promise<AdminCredentials | null> {
  const rows = await sql.unsafe<AdminCredentials[]>(
    `SELECT id, email, password_hash, role, status
     FROM admin_users WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<AdminSummary | null> {
  const rows = await sql.unsafe<AdminSummary[]>(
    `SELECT id, email, role, status, created_at
     FROM admin_users WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function insertRefreshToken(
  input: NewRefreshToken,
): Promise<RefreshToken> {
  const rows = await sql.unsafe<RefreshToken[]>(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, revoked_at)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, token_hash, expires_at, revoked_at, created_at`,
    [input.user_id, input.token_hash, input.expires_at, input.revoked_at],
  );
  return rows[0];
}

export async function findRefreshTokenByHash(
  tokenHash: string,
): Promise<RefreshToken | null> {
  const rows = await sql.unsafe<RefreshToken[]>(
    `SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
     FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function revokeRefreshToken(id: string): Promise<void> {
  await sql.unsafe(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`,
    [id],
  );
}

export async function revokeAllRefreshTokensForUser(
  userId: string,
): Promise<void> {
  await sql.unsafe(
    `UPDATE refresh_tokens SET revoked_at = now()
     WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId],
  );
}

export async function listAdmins(): Promise<AdminSummary[]> {
  return sql.unsafe<AdminSummary[]>(
    `SELECT id, email, role, status, created_at
     FROM admin_users ORDER BY created_at`,
  );
}

export async function insertInvitedAdmin(
  input: NewInvitedAdmin,
): Promise<AdminSummary> {
  const rows = await sql.unsafe<AdminSummary[]>(
    `INSERT INTO admin_users (email, status, password_hash)
     VALUES ($1, 'invited', NULL)
     RETURNING id, email, role, status, created_at`,
    [input.email],
  );
  return rows[0];
}

export async function updateAdmin(
  id: string,
  patch: AdminPatch,
): Promise<AdminSummary> {
  const rows = await sql.unsafe<AdminSummary[]>(
    `UPDATE admin_users
     SET role = COALESCE($1, role),
         status = COALESCE($2, status),
         updated_at = now()
     WHERE id = $3
     RETURNING id, email, role, status, created_at`,
    [patch.role ?? null, patch.status ?? null, id],
  );
  return rows[0];
}

export async function setPasswordAndActivate(
  id: string,
  passwordHash: string,
): Promise<AdminSummary> {
  const rows = await sql.unsafe<AdminSummary[]>(
    `UPDATE admin_users
     SET password_hash = $1, status = 'active', updated_at = now()
     WHERE id = $2
     RETURNING id, email, role, status, created_at`,
    [passwordHash, id],
  );
  return rows[0];
}

export async function updatePassword(
  id: string,
  passwordHash: string,
): Promise<AdminSummary> {
  const rows = await sql.unsafe<AdminSummary[]>(
    `UPDATE admin_users
     SET password_hash = $1, updated_at = now()
     WHERE id = $2
     RETURNING id, email, role, status, created_at`,
    [passwordHash, id],
  );
  return rows[0];
}

export async function removeAdmin(id: string): Promise<void> {
  await sql.unsafe(`DELETE FROM admin_users WHERE id = $1`, [id]);
}

export async function countActiveSuperadmins(
  excludeId: string,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM admin_users
     WHERE role = 'superadmin' AND status = 'active' AND id != $1`,
    [excludeId],
  );
  return rows[0].count;
}

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

export async function deleteStaleRefreshTokens(): Promise<number> {
  const result = await sql.unsafe(
    `DELETE FROM refresh_tokens
     WHERE expires_at < now()
        OR (revoked_at IS NOT NULL AND revoked_at < now() - interval '30 days')`,
  );
  return result.count;
}

export async function deleteStaleActionTokens(): Promise<number> {
  const result = await sql.unsafe(
    `DELETE FROM admin_action_tokens
     WHERE expires_at < now()
        OR (used_at IS NOT NULL AND used_at < now() - interval '30 days')`,
  );
  return result.count;
}
