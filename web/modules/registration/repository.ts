import { sql } from "@/modules/db/postgres";
import type {
  NewRegistration,
  Registration,
  RegistrationStatus,
} from "./entity";

export async function insert(input: NewRegistration): Promise<Registration> {
  const rows = await sql.unsafe<Registration[]>(
    `INSERT INTO registrations (parent_name, student_name, whatsapp, email, message, ip_address)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, parent_name, student_name, whatsapp, email, message, ip_address, status, created_at`,
    [
      input.parent_name,
      input.student_name,
      input.whatsapp,
      input.email,
      input.message,
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
  input: Pick<Registration, "student_name" | "whatsapp">,
  hoursAgo: number,
): Promise<boolean> {
  const rows = await sql.unsafe(
    `SELECT id
     FROM registrations
     WHERE lower(student_name) = lower($1)
       AND whatsapp = $2
       AND created_at > now() - ($3 || ' hours')::interval
     LIMIT 1`,
    [input.student_name, input.whatsapp, hoursAgo],
  );
  return rows.length > 0;
}

export async function list(): Promise<Registration[]> {
  return sql.unsafe<Registration[]>(
    `SELECT id, parent_name, student_name, whatsapp, email, message, ip_address, status, created_at
     FROM registrations
     ORDER BY created_at DESC`,
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
     RETURNING id, parent_name, student_name, whatsapp, email, message, ip_address, status, created_at`,
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
