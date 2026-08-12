import { sql } from "@/modules/db/postgres";
import type { Achievement, NewAchievement } from "./entity";

const COLUMNS = "id, emoji, title, description, created_at, updated_at";

export async function list(): Promise<Achievement[]> {
  return sql.unsafe<Achievement[]>(
    `SELECT ${COLUMNS} FROM achievements ORDER BY created_at`,
  );
}

export async function insert(input: NewAchievement): Promise<Achievement> {
  const rows = await sql.unsafe<Achievement[]>(
    `INSERT INTO achievements (emoji, title, description)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [input.emoji, input.title, input.description],
  );
  return rows[0];
}

export async function update(
  id: string,
  input: NewAchievement,
): Promise<Achievement> {
  const rows = await sql.unsafe<Achievement[]>(
    `UPDATE achievements
     SET emoji = $1, title = $2, description = $3, updated_at = now()
     WHERE id = $4
     RETURNING ${COLUMNS}`,
    [input.emoji, input.title, input.description, id],
  );
  return rows[0];
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe(`DELETE FROM achievements WHERE id = $1`, [id]);
}
