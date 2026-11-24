import type { TransactionSql } from "postgres";
import { sql } from "@/modules/db/postgres";
import type {
  ObservationRow,
  ObservationScoreRow,
  SaveObservationInput,
} from "./entity";

export async function findByRegistrationId(
  registrationId: string,
): Promise<ObservationRow | null> {
  const rows = await sql.unsafe<ObservationRow[]>(
    `SELECT registration_id, observer_id, observed_on::text AS observed_on,
            note, recommendation, completed_at
     FROM observations
     WHERE registration_id = $1`,
    [registrationId],
  );
  return rows[0] ?? null;
}

export async function listScores(
  registrationId: string,
): Promise<ObservationScoreRow[]> {
  return sql.unsafe<ObservationScoreRow[]>(
    `SELECT indicator, score, note
     FROM observation_scores
     WHERE registration_id = $1
     ORDER BY indicator`,
    [registrationId],
  );
}

export async function saveWithin(
  tx: TransactionSql,
  input: SaveObservationInput,
): Promise<void> {
  await tx.unsafe(
    `INSERT INTO observations (
       registration_id, observer_id, observed_on, note, recommendation,
       completed_at, created_by, updated_by
     )
     VALUES ($1, $2, $3, $4, $5, CASE WHEN $6::boolean THEN now() END, $7, $7)
     ON CONFLICT (registration_id) DO UPDATE SET
       observer_id = EXCLUDED.observer_id,
       note = EXCLUDED.note,
       recommendation = EXCLUDED.recommendation,
       completed_at = CASE WHEN $6::boolean THEN now()
                           ELSE observations.completed_at END,
       updated_by = EXCLUDED.updated_by,
       updated_at = now()`,
    [
      input.registrationId,
      input.observerId,
      input.observedOn,
      input.note,
      input.recommendation,
      input.isComplete,
      input.actorId,
    ],
  );
  const scoresJson = JSON.stringify(input.scores);
  await tx.unsafe(
    `INSERT INTO observation_scores (registration_id, indicator, score, note)
     SELECT $1::uuid, item.indicator, item.score, item.note
     FROM jsonb_to_recordset($2::text::jsonb)
          AS item(indicator smallint, score smallint, note text)
     ON CONFLICT (registration_id, indicator) DO UPDATE SET
       score = EXCLUDED.score,
       note = EXCLUDED.note`,
    [input.registrationId, scoresJson],
  );
}
