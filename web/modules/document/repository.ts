import { sql } from "@/modules/db/postgres";
import type { DocumentLink, NewDocumentLink } from "./entity";

export async function upsertLink(input: NewDocumentLink): Promise<void> {
  await sql.unsafe(
    `INSERT INTO document_links (registration_id, token_hash, expires_at, created_by)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (registration_id) DO UPDATE
     SET token_hash = EXCLUDED.token_hash,
         expires_at = EXCLUDED.expires_at,
         created_by = EXCLUDED.created_by,
         created_at = now()`,
    [input.registrationId, input.tokenHash, input.expiresAt, input.createdBy],
  );
}

export async function findActiveLink(
  tokenHash: string,
): Promise<DocumentLink | null> {
  const rows = await sql.unsafe<DocumentLink[]>(
    `SELECT registration_id, expires_at
     FROM document_links
     WHERE token_hash = $1 AND expires_at > now()`,
    [tokenHash],
  );
  return rows[0] ?? null;
}
