import { sql } from "@/modules/db/postgres";
import type { NewSchoolProfile, SchoolProfile } from "./entity";

const COLUMNS = `
  id, photo_url, vision_photo_url, description, visi, misi, alamat, telepon,
  whatsapp, whatsapp_message, email, jam_operasional, facebook, instagram,
  tiktok, youtube, created_at, updated_at
`;

export async function get(): Promise<SchoolProfile | null> {
  const rows = await sql.unsafe<SchoolProfile[]>(
    `SELECT ${COLUMNS} FROM school_profiles ORDER BY created_at LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function upsert(input: NewSchoolProfile): Promise<SchoolProfile> {
  const existing = await get();

  const values = [
    input.photo_url,
    input.vision_photo_url,
    input.description,
    input.visi,
    input.misi,
    input.alamat,
    input.telepon,
    input.whatsapp,
    input.whatsapp_message,
    input.email,
    input.jam_operasional,
    input.facebook,
    input.instagram,
    input.tiktok,
    input.youtube,
  ];

  if (existing) {
    const rows = await sql.unsafe<SchoolProfile[]>(
      `UPDATE school_profiles
       SET photo_url = $1, vision_photo_url = $2, description = $3, visi = $4,
           misi = $5, alamat = $6, telepon = $7, whatsapp = $8,
           whatsapp_message = $9, email = $10, jam_operasional = $11,
           facebook = $12, instagram = $13, tiktok = $14, youtube = $15,
           updated_at = now()
       WHERE id = $16
       RETURNING ${COLUMNS}`,
      [...values, existing.id],
    );
    return rows[0];
  }

  const rows = await sql.unsafe<SchoolProfile[]>(
    `INSERT INTO school_profiles (
       photo_url, vision_photo_url, description, visi, misi, alamat, telepon,
       whatsapp, whatsapp_message, email, jam_operasional, facebook, instagram,
       tiktok, youtube
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
     )
     RETURNING ${COLUMNS}`,
    values,
  );
  return rows[0];
}
