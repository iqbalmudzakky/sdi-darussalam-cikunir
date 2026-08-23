import { sql } from "@/modules/db/postgres";
import type {
  NewRegistration,
  Registration,
  RegistrationStatus,
} from "./entity";

const COLUMNS = `
  id, registration_type, full_name, gender, place_of_birth,
  date_of_birth, current_address, physical_disability, previous_school, nisn,
  father_status, father_name, father_place_of_birth, father_date_of_birth, father_phone,
  mother_status, mother_name, mother_place_of_birth, mother_date_of_birth, mother_phone,
  parent_email, ip_address, status, created_at
`;

export async function insert(input: NewRegistration): Promise<Registration> {
  const rows = await sql.unsafe<Registration[]>(
    `INSERT INTO registrations (
       registration_type, full_name, gender, place_of_birth,
       date_of_birth, current_address, physical_disability, previous_school, nisn,
       father_status, father_name, father_place_of_birth, father_date_of_birth, father_phone,
       mother_status, mother_name, mother_place_of_birth, mother_date_of_birth, mother_phone,
       parent_email, ip_address
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
       $17, $18, $19, $20, $21
     )
     RETURNING ${COLUMNS}`,
    [
      input.registration_type,
      input.full_name,
      input.gender,
      input.place_of_birth,
      input.date_of_birth,
      input.current_address,
      input.physical_disability,
      input.previous_school,
      input.nisn,
      input.father_status,
      input.father_name,
      input.father_place_of_birth,
      input.father_date_of_birth,
      input.father_phone,
      input.mother_status,
      input.mother_name,
      input.mother_place_of_birth,
      input.mother_date_of_birth,
      input.mother_phone,
      input.parent_email,
      input.ip_address,
    ],
  );
  return rows[0];
}

export async function countByIpSince(
  ip: string,
  minutesAgo: number,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count
     FROM registrations
     WHERE ip_address = $1
       AND created_at > now() - ($2 || ' minutes')::interval`,
    [ip, minutesAgo],
  );
  return rows[0].count;
}

export async function existsRecentDuplicate(
  input: Pick<Registration, "full_name" | "date_of_birth">,
  hoursAgo: number,
): Promise<boolean> {
  const rows = await sql.unsafe(
    `SELECT id
     FROM registrations
     WHERE lower(full_name) = lower($1)
       AND date_of_birth = $2
       AND created_at > now() - ($3 || ' hours')::interval
     LIMIT 1`,
    [input.full_name, input.date_of_birth, hoursAgo],
  );
  return rows.length > 0;
}

export async function list(): Promise<Registration[]> {
  return sql.unsafe<Registration[]>(
    `SELECT ${COLUMNS} FROM registrations ORDER BY created_at DESC`,
  );
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe(`DELETE FROM registrations WHERE id = $1`, [id]);
}

export async function updateStatus(
  id: string,
  status: RegistrationStatus,
): Promise<Registration> {
  const rows = await sql.unsafe<Registration[]>(
    `UPDATE registrations
     SET status = $1
     WHERE id = $2
     RETURNING ${COLUMNS}`,
    [status, id],
  );
  return rows[0];
}

export async function countByStatus(
  status: RegistrationStatus,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count FROM registrations WHERE status = $1`,
    [status],
  );
  return rows[0].count;
}
