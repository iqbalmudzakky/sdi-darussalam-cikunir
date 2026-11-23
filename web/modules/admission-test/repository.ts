import type { TransactionSql } from "postgres";
import { sql } from "@/modules/db/postgres";
import type { AdmissionTestRow, SaveAdmissionTestInput } from "./entity";

export async function findByRegistrationId(
  registrationId: string,
): Promise<AdmissionTestRow | null> {
  const rows = await sql.unsafe<AdmissionTestRow[]>(
    `SELECT registration_id, test_date::text AS test_date,
            to_char(test_time, 'HH24:MI') AS test_time, child_interviewer_id,
            parent_interviewer_id, reminded_at
     FROM admission_tests
     WHERE registration_id = $1`,
    [registrationId],
  );
  return rows[0] ?? null;
}

export async function listUnremindedBetween(
  fromDate: string,
  toDate: string,
): Promise<AdmissionTestRow[]> {
  return sql.unsafe<AdmissionTestRow[]>(
    `SELECT registration_id, test_date::text AS test_date,
            to_char(test_time, 'HH24:MI') AS test_time, child_interviewer_id,
            parent_interviewer_id, reminded_at
     FROM admission_tests
     WHERE test_date BETWEEN $1 AND $2 AND reminded_at IS NULL
     ORDER BY test_date, test_time`,
    [fromDate, toDate],
  );
}

export async function saveWithin(
  tx: TransactionSql,
  input: SaveAdmissionTestInput,
): Promise<void> {
  await tx.unsafe(
    `INSERT INTO admission_tests (
       registration_id, test_date, test_time, child_interviewer_id,
       parent_interviewer_id, created_by
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (registration_id) DO UPDATE SET
       test_date = EXCLUDED.test_date,
       test_time = EXCLUDED.test_time,
       child_interviewer_id = EXCLUDED.child_interviewer_id,
       parent_interviewer_id = EXCLUDED.parent_interviewer_id,
       reminded_at = CASE
         WHEN admission_tests.test_date = EXCLUDED.test_date
          AND admission_tests.test_time = EXCLUDED.test_time
         THEN admission_tests.reminded_at
       END,
       reminded_by = CASE
         WHEN admission_tests.test_date = EXCLUDED.test_date
          AND admission_tests.test_time = EXCLUDED.test_time
         THEN admission_tests.reminded_by
       END,
       updated_at = now()`,
    [
      input.registrationId,
      input.testDate,
      input.testTime,
      input.childInterviewerId,
      input.parentInterviewerId,
      input.actorId,
    ],
  );
}

export async function markReminded(
  registrationId: string,
  actorId: string,
): Promise<boolean> {
  const rows = await sql.unsafe(
    `UPDATE admission_tests
     SET reminded_at = now(), reminded_by = $2, updated_at = now()
     WHERE registration_id = $1
     RETURNING registration_id`,
    [registrationId, actorId],
  );
  return rows.length > 0;
}
