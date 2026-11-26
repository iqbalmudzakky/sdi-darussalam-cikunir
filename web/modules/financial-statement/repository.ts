import { sql } from "@/modules/db/postgres";
import type { SaveStatementInput, StatementRow } from "./entity";

export async function findByRegistrationId(
  registrationId: string,
): Promise<StatementRow | null> {
  const rows = await sql.unsafe<StatementRow[]>(
    `SELECT registration_id, content
     FROM financial_statements
     WHERE registration_id = $1`,
    [registrationId],
  );
  return rows[0] ?? null;
}

export async function save(input: SaveStatementInput): Promise<void> {
  const contentJson = JSON.stringify(input.content);
  await sql.unsafe(
    `INSERT INTO financial_statements (registration_id, content, created_by, updated_by)
     VALUES ($1, $2::text::jsonb, $3, $3)
     ON CONFLICT (registration_id) DO UPDATE SET
       content = EXCLUDED.content,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()`,
    [input.registrationId, contentJson, input.actorId],
  );
}
