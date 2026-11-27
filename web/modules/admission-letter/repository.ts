import { sql } from "@/modules/db/postgres";
import { ADMISSION_LETTER_KIND } from "@/modules/shared/constant/admission/letter";
import type {
  DecisionLetterRow,
  LetterSequenceInput,
  SaveDecisionLetterInput,
  SaveStatementInput,
  StatementRow,
} from "./entity";

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

export async function findDecisionLetter(
  registrationId: string,
): Promise<DecisionLetterRow | null> {
  const rows = await sql.unsafe<DecisionLetterRow[]>(
    `SELECT registration_id, content
     FROM admission_letters
     WHERE registration_id = $1 AND kind = $2`,
    [registrationId, ADMISSION_LETTER_KIND.decision],
  );
  return rows[0] ?? null;
}

export async function findLastLetterSequence(
  letterYear: number,
): Promise<number> {
  const rows = await sql.unsafe<{ last_sequence: number | null }[]>(
    `SELECT max(letter_sequence) AS last_sequence
     FROM admission_letters
     WHERE kind = $1 AND letter_year = $2`,
    [ADMISSION_LETTER_KIND.decision, letterYear],
  );
  return rows[0]?.last_sequence ?? 0;
}

export async function saveDecisionLetter(
  input: SaveDecisionLetterInput,
): Promise<void> {
  const contentJson = JSON.stringify(input.content);
  await sql.unsafe(
    `INSERT INTO admission_letters (
       registration_id, kind, content, letter_year, letter_sequence, created_by, updated_by
     )
     VALUES ($1, $2, $3::text::jsonb, $4, $5, $6, $6)
     ON CONFLICT (registration_id, kind) DO UPDATE SET
       content = EXCLUDED.content,
       letter_year = EXCLUDED.letter_year,
       letter_sequence = EXCLUDED.letter_sequence,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()`,
    [
      input.registrationId,
      ADMISSION_LETTER_KIND.decision,
      contentJson,
      input.letterYear,
      input.letterSequence,
      input.actorId,
    ],
  );
}

export async function existsLetterSequence(
  input: LetterSequenceInput,
): Promise<boolean> {
  const rows = await sql.unsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM admission_letters
       WHERE kind = $1 AND letter_year = $2 AND letter_sequence = $3
         AND registration_id <> $4
     ) AS exists`,
    [
      ADMISSION_LETTER_KIND.decision,
      input.letterYear,
      input.letterSequence,
      input.registrationId,
    ],
  );
  return rows[0]?.exists ?? false;
}
