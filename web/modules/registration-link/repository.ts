import { sql } from "@/modules/db/postgres";
import type {
  NewRegistrationLink,
  RegistrationLink,
  RegistrationLinkKind,
} from "./entity";

export async function upsert(input: NewRegistrationLink): Promise<void> {
  await sql.unsafe(
    `INSERT INTO registration_links (
       registration_id, kind, token_hash, expires_at, created_by
     )
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (registration_id, kind) DO UPDATE
     SET token_hash = EXCLUDED.token_hash,
         expires_at = EXCLUDED.expires_at,
         created_by = EXCLUDED.created_by,
         created_at = now()`,
    [
      input.registrationId,
      input.kind,
      input.tokenHash,
      input.expiresAt,
      input.createdBy,
    ],
  );
}

export async function findByTokenHash(
  tokenHash: string,
  kind: RegistrationLinkKind,
): Promise<RegistrationLink | null> {
  const rows = await sql.unsafe<RegistrationLink[]>(
    `SELECT registration_id, expires_at
     FROM registration_links
     WHERE token_hash = $1 AND kind = $2`,
    [tokenHash, kind],
  );
  return rows[0] ?? null;
}
