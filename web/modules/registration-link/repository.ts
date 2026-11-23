import { sql } from "@/modules/db/postgres";
import type { NewRegistrationFormLink, RegistrationFormLink } from "./entity";

export async function upsert(input: NewRegistrationFormLink): Promise<void> {
  await sql.unsafe(
    `INSERT INTO registration_form_links (
       registration_id, token_hash, expires_at, created_by
     )
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (registration_id) DO UPDATE
     SET token_hash = EXCLUDED.token_hash,
         expires_at = EXCLUDED.expires_at,
         created_by = EXCLUDED.created_by,
         created_at = now()`,
    [input.registrationId, input.tokenHash, input.expiresAt, input.createdBy],
  );
}

export async function findByTokenHash(
  tokenHash: string,
): Promise<RegistrationFormLink | null> {
  const rows = await sql.unsafe<RegistrationFormLink[]>(
    `SELECT registration_id, expires_at
     FROM registration_form_links
     WHERE token_hash = $1`,
    [tokenHash],
  );
  return rows[0] ?? null;
}
