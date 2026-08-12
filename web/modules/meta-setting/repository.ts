import { sql } from "@/modules/db/postgres";
import type { MetaSetting, UpdateMetaSetting } from "./entity";

const COLUMNS = `
  id,
  meta_title,
  meta_description,
  meta_keywords,
  og_title,
  og_description,
  og_image_url,
  twitter_title,
  twitter_description,
  twitter_image_url,
  canonical_url,
  robots_index,
  robots_follow,
  favicon_url,
  created_at,
  updated_at
`;

export async function get(): Promise<MetaSetting | null> {
  const rows = await sql.unsafe<MetaSetting[]>(
    `SELECT ${COLUMNS}
     FROM meta_settings
     WHERE id = 1
     LIMIT 1`,
  );

  return rows[0] ?? null;
}

export async function update(input: UpdateMetaSetting): Promise<MetaSetting> {
  const rows = await sql.unsafe<MetaSetting[]>(
    `UPDATE meta_settings
     SET
       meta_title = $1,
       meta_description = $2,
       meta_keywords = $3,
       og_title = $4,
       og_description = $5,
       og_image_url = $6,
       twitter_title = $7,
       twitter_description = $8,
       twitter_image_url = $9,
       canonical_url = $10,
       robots_index = $11,
       robots_follow = $12,
       favicon_url = $13,
       updated_at = now()
     WHERE id = 1
     RETURNING ${COLUMNS}`,
    [
      input.meta_title,
      input.meta_description,
      input.meta_keywords,
      input.og_title,
      input.og_description,
      input.og_image_url,
      input.twitter_title,
      input.twitter_description,
      input.twitter_image_url,
      input.canonical_url,
      input.robots_index,
      input.robots_follow,
      input.favicon_url,
    ],
  );

  return rows[0];
}
