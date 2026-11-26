import { sql } from "@/modules/db/postgres";
import { ADMISSION_LETTER_KIND } from "@/modules/shared/constant/admission/letter";
import type { SaveStatementInput, StatementRow } from "./entity";

export async function findStatement(
  registrationId: string,
): Promise<StatementRow | null> {
  const rows = await sql.unsafe<StatementRow[]>(
    `SELECT registration_id, content
     FROM admission_letters
     WHERE registration_id = $1 AND kind = $2`,
    [registrationId, ADMISSION_LETTER_KIND.statement],
  );
  return rows[0] ?? null;
}

export async function saveStatement(input: SaveStatementInput): Promise<void> {
  const contentJson = JSON.stringify(input.content);
  await sql.unsafe(
    `INSERT INTO admission_letters (registration_id, kind, content, created_by, updated_by)
     VALUES ($1, $2, $3::text::jsonb, $4, $4)
     ON CONFLICT (registration_id, kind) DO UPDATE SET
       content = EXCLUDED.content,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()`,
    [
      input.registrationId,
      ADMISSION_LETTER_KIND.statement,
      contentJson,
      input.actorId,
    ],
  );
}
