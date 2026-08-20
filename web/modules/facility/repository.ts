import { sql } from "@/modules/db/postgres";
import type { Facility, NewFacility } from "./entity";

const COLUMNS = "id, title, subtitle, emoji, photo_url, created_at, updated_at";

export async function list(): Promise<Facility[]> {
  return sql.unsafe<Facility[]>(
    `SELECT ${COLUMNS} FROM facilities ORDER BY created_at`,
  );
}

export async function getById(id: string): Promise<Facility | null> {
  const rows = await sql.unsafe<Facility[]>(
    `SELECT ${COLUMNS} FROM facilities WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function create(input: NewFacility): Promise<Facility> {
  const rows = await sql.unsafe<Facility[]>(
    `INSERT INTO facilities (title, subtitle, emoji, photo_url)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    [input.title, input.subtitle, input.emoji, input.photo_url],
  );
  return rows[0];
}

export async function update(
  id: string,
  input: NewFacility,
): Promise<Facility> {
  const rows = await sql.unsafe<Facility[]>(
    `UPDATE facilities
     SET title = $1, subtitle = $2, emoji = $3, photo_url = $4, updated_at = now()
     WHERE id = $5
     RETURNING ${COLUMNS}`,
    [input.title, input.subtitle, input.emoji, input.photo_url, id],
  );
  return rows[0];
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe(`DELETE FROM facilities WHERE id = $1`, [id]);
}
