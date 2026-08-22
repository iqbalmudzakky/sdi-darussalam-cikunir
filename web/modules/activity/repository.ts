import { sql } from "@/modules/db/postgres";
import type { Activity, NewActivity } from "./entity";

const COLUMNS =
  "id, title, description, emoji, badge, photo_url, youtube_url, created_at, updated_at";

export async function list(): Promise<Activity[]> {
  return sql.unsafe<Activity[]>(
    `SELECT ${COLUMNS} FROM activities ORDER BY created_at`,
  );
}

export async function findById(id: string): Promise<Activity | null> {
  const rows = await sql.unsafe<Activity[]>(
    `SELECT ${COLUMNS} FROM activities WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function insert(input: NewActivity): Promise<Activity> {
  const rows = await sql.unsafe<Activity[]>(
    `INSERT INTO activities (title, description, emoji, badge, photo_url, youtube_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${COLUMNS}`,
    [
      input.title,
      input.description,
      input.emoji,
      input.badge,
      input.photo_url,
      input.youtube_url,
    ],
  );
  return rows[0];
}

export async function update(
  id: string,
  input: NewActivity,
): Promise<Activity> {
  const rows = await sql.unsafe<Activity[]>(
    `UPDATE activities
     SET title = $1, description = $2, emoji = $3, badge = $4, photo_url = $5, youtube_url = $6, updated_at = now()
     WHERE id = $7
     RETURNING ${COLUMNS}`,
    [
      input.title,
      input.description,
      input.emoji,
      input.badge,
      input.photo_url,
      input.youtube_url,
      id,
    ],
  );
  return rows[0];
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe(`DELETE FROM activities WHERE id = $1`, [id]);
}
