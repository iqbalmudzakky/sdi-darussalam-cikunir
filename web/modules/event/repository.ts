import { sql } from "@/modules/db/postgres";
import type { Event, NewEvent, UpdatedEvent } from "./entity";

export async function list(): Promise<Event[]> {
  return sql.unsafe<Event[]>(
    `SELECT id, slug, title, category, summary, body, poster_url, event_date, is_published, published_at, created_at, updated_at
     FROM events
     ORDER BY is_published ASC, event_date DESC`,
  );
}

export async function findById(id: string): Promise<Event | null> {
  const rows = await sql.unsafe<Event[]>(
    `SELECT id, slug, title, category, summary, body, poster_url, event_date, is_published, published_at, created_at, updated_at
     FROM events
     WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function findBySlug(slug: string): Promise<Event | null> {
  const rows = await sql.unsafe<Event[]>(
    `SELECT id, slug, title, category, summary, body, poster_url, event_date, is_published, published_at, created_at, updated_at
     FROM events
     WHERE slug = $1`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function listPublished(): Promise<Event[]> {
  return sql.unsafe<Event[]>(
    `SELECT id, slug, title, category, summary, body, poster_url, event_date::text AS event_date, is_published, published_at, created_at, updated_at
     FROM events
     WHERE is_published = true
     ORDER BY event_date DESC, published_at DESC`,
  );
}

export async function listLatestPublished(limit: number): Promise<Event[]> {
  return sql.unsafe<Event[]>(
    `SELECT id, slug, title, category, summary, body, poster_url, event_date::text AS event_date, is_published, published_at, created_at, updated_at
     FROM events
     WHERE is_published = true
     ORDER BY event_date DESC, published_at DESC
     LIMIT $1`,
    [limit],
  );
}

export async function findPublishedBySlug(slug: string): Promise<Event | null> {
  const rows = await sql.unsafe<Event[]>(
    `SELECT id, slug, title, category, summary, body, poster_url, event_date::text AS event_date, is_published, published_at, created_at, updated_at
     FROM events
     WHERE slug = $1 AND is_published = true`,
    [slug],
  );
  return rows[0] ?? null;
}

export async function findSlugsByPrefix(
  base: string,
  excludeId?: string,
): Promise<string[]> {
  const rows = await sql.unsafe<{ slug: string }[]>(
    `SELECT slug FROM events
     WHERE (slug = $1 OR slug LIKE $2)
       AND ($3::uuid IS NULL OR id <> $3::uuid)`,
    [base, `${base}-%`, excludeId ?? null],
  );
  return rows.map((row) => row.slug);
}

export async function insert(input: NewEvent): Promise<Event> {
  const rows = await sql.unsafe<Event[]>(
    `INSERT INTO events (slug, title, category, summary, body, poster_url, event_date, is_published, published_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, slug, title, category, summary, body, poster_url, event_date, is_published, published_at, created_at, updated_at`,
    [
      input.slug,
      input.title,
      input.category,
      input.summary,
      input.body,
      input.poster_url,
      input.event_date,
      input.is_published,
      input.published_at,
    ],
  );
  return rows[0];
}

export async function update(id: string, input: UpdatedEvent): Promise<Event> {
  const rows = await sql.unsafe<Event[]>(
    `UPDATE events
     SET slug = $1, title = $2, category = $3, summary = $4, body = $5, poster_url = $6,
         event_date = $7, is_published = $8, published_at = $9, updated_at = now()
     WHERE id = $10
     RETURNING id, slug, title, category, summary, body, poster_url, event_date, is_published, published_at, created_at, updated_at`,
    [
      input.slug,
      input.title,
      input.category,
      input.summary,
      input.body,
      input.poster_url,
      input.event_date,
      input.is_published,
      input.published_at,
      id,
    ],
  );
  return rows[0];
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe(`DELETE FROM events WHERE id = $1`, [id]);
}
