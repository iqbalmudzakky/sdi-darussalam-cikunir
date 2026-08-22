import { sql } from "@/modules/db/postgres";
import type { AdminUser, NewRefreshToken, RefreshToken } from "./entity";

const ADMIN_USER_COLUMNS =
  "id, email, password_hash, role, created_at, updated_at";
const REFRESH_TOKEN_COLUMNS =
  "id, user_id, token_hash, expires_at, revoked_at, created_at";

export async function findByEmail(email: string): Promise<AdminUser | null> {
  const rows = await sql.unsafe<AdminUser[]>(
    `SELECT ${ADMIN_USER_COLUMNS} FROM admin_users WHERE email = $1`,
    [email],
  );
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<AdminUser | null> {
  const rows = await sql.unsafe<AdminUser[]>(
    `SELECT ${ADMIN_USER_COLUMNS} FROM admin_users WHERE id = $1`,
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
     RETURNING ${REFRESH_TOKEN_COLUMNS}`,
    [input.user_id, input.token_hash, input.expires_at, input.revoked_at],
  );
  return rows[0];
}

export async function findRefreshTokenByHash(
  tokenHash: string,
): Promise<RefreshToken | null> {
  const rows = await sql.unsafe<RefreshToken[]>(
    `SELECT ${REFRESH_TOKEN_COLUMNS} FROM refresh_tokens WHERE token_hash = $1`,
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
