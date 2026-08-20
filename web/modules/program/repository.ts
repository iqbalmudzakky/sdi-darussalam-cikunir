import { sql } from "@/modules/db/postgres";
import type { Program, NewProgram } from "./entity";

const COLUMNS = "id, title, description, emoji, created_at, updated_at";

export async function list(): Promise<Program[]> {
  return sql.unsafe<Program[]>(
    `SELECT ${COLUMNS} FROM programs ORDER BY created_at`,
  );
}

export async function getById(id: string): Promise<Program | null> {
  const rows = await sql.unsafe<Program[]>(
    `SELECT ${COLUMNS} FROM programs WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function create(input: NewProgram): Promise<Program> {
  const rows = await sql.unsafe<Program[]>(
    `INSERT INTO programs (title, description, emoji)
     VALUES ($1, $2, $3)
     RETURNING ${COLUMNS}`,
    [input.title, input.description, input.emoji],
  );
  return rows[0];
}

export async function update(id: string, input: NewProgram): Promise<Program> {
  const rows = await sql.unsafe<Program[]>(
    `UPDATE programs
     SET title = $1, description = $2, emoji = $3, updated_at = now()
     WHERE id = $4
     RETURNING ${COLUMNS}`,
    [input.title, input.description, input.emoji, id],
  );
  return rows[0];
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe(`DELETE FROM programs WHERE id = $1`, [id]);
}
