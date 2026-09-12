import { sql } from "@/modules/db/postgres";
import type {
  NewSchoolProfile,
  SchoolProfile,
  SchoolProfileStatsInput,
} from "./entity";

export async function get(): Promise<SchoolProfile | null> {
  const rows = await sql.unsafe<SchoolProfile[]>(
    `SELECT id, photo_url, vision_photo_url, hero_video_url, description, visi,
       misi, alamat, telepon, whatsapp, whatsapp_message, email,
       jam_operasional, facebook, instagram, tiktok, youtube,
       active_student_count, staff_count, created_at, updated_at
     FROM school_profiles
     ORDER BY created_at
     LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function upsert(input: NewSchoolProfile): Promise<SchoolProfile> {
  const existing = await get();

  const values = [
    input.photo_url,
    input.vision_photo_url,
    input.hero_video_url,
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
       SET photo_url = $1, vision_photo_url = $2, hero_video_url = $3,
           description = $4, visi = $5, misi = $6, alamat = $7, telepon = $8,
           whatsapp = $9, whatsapp_message = $10, email = $11,
           jam_operasional = $12, facebook = $13, instagram = $14,
           tiktok = $15, youtube = $16,
           updated_at = now()
       WHERE id = $17
       RETURNING id, photo_url, vision_photo_url, hero_video_url, description,
         visi, misi, alamat, telepon, whatsapp, whatsapp_message, email,
         jam_operasional, facebook, instagram, tiktok, youtube,
         active_student_count, staff_count, created_at, updated_at`,
      [...values, existing.id],
    );
    return rows[0];
  }

  const rows = await sql.unsafe<SchoolProfile[]>(
    `INSERT INTO school_profiles (
       photo_url, vision_photo_url, hero_video_url, description, visi, misi,
       alamat, telepon, whatsapp, whatsapp_message, email, jam_operasional,
       facebook, instagram, tiktok, youtube
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
     )
     RETURNING id, photo_url, vision_photo_url, hero_video_url, description,
       visi, misi, alamat, telepon, whatsapp, whatsapp_message, email,
       jam_operasional, facebook, instagram, tiktok, youtube,
       active_student_count, staff_count, created_at, updated_at`,
    values,
  );
  return rows[0];
}

export async function insertStats(
  input: SchoolProfileStatsInput,
): Promise<SchoolProfile> {
  const rows = await sql.unsafe<SchoolProfile[]>(
    `INSERT INTO school_profiles (active_student_count, staff_count)
     VALUES ($1, $2)
     RETURNING id, photo_url, vision_photo_url, hero_video_url, description,
       visi, misi, alamat, telepon, whatsapp, whatsapp_message, email,
       jam_operasional, facebook, instagram, tiktok, youtube,
       active_student_count, staff_count, created_at, updated_at`,
    [input.activeStudentCount, input.staffCount],
  );
  return rows[0];
}

export async function updateStatsById(
  id: string,
  input: SchoolProfileStatsInput,
): Promise<SchoolProfile> {
  const rows = await sql.unsafe<SchoolProfile[]>(
    `UPDATE school_profiles
     SET active_student_count = $1, staff_count = $2, updated_at = now()
     WHERE id = $3
     RETURNING id, photo_url, vision_photo_url, hero_video_url, description,
       visi, misi, alamat, telepon, whatsapp, whatsapp_message, email,
       jam_operasional, facebook, instagram, tiktok, youtube,
       active_student_count, staff_count, created_at, updated_at`,
    [input.activeStudentCount, input.staffCount, id],
  );
  return rows[0];
}
