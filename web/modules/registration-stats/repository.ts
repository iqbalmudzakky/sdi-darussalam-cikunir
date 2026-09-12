import { sql } from "@/modules/db/postgres";
import type { TransactionSql } from "postgres";
import type { RegistrationStats } from "./entity";

export async function list(): Promise<RegistrationStats[]> {
  return sql.unsafe<RegistrationStats[]>(
    `SELECT academic_year, offline_count, is_current, created_at, updated_at
     FROM registration_stats
     ORDER BY academic_year DESC`,
  );
}

export async function get(
  academicYear: string,
): Promise<RegistrationStats | null> {
  const rows = await sql.unsafe<RegistrationStats[]>(
    `SELECT academic_year, offline_count, is_current, created_at, updated_at
     FROM registration_stats
     WHERE academic_year = $1`,
    [academicYear],
  );
  return rows[0] ?? null;
}

export async function getCurrent(): Promise<RegistrationStats | null> {
  const rows = await sql.unsafe<RegistrationStats[]>(
    `SELECT academic_year, offline_count, is_current, created_at, updated_at
     FROM registration_stats
     WHERE is_current
     LIMIT 1`,
  );
  return rows[0] ?? null;
}

export async function findCurrentAcademicYearWithin(
  tx: TransactionSql,
): Promise<string | null> {
  const rows = await tx.unsafe<{ academic_year: string }[]>(
    `SELECT academic_year
     FROM registration_stats
     WHERE is_current
     LIMIT 1`,
  );
  return rows[0]?.academic_year ?? null;
}

export async function create(academicYear: string): Promise<RegistrationStats> {
  const rows = await sql.unsafe<RegistrationStats[]>(
    `INSERT INTO registration_stats (academic_year)
     VALUES ($1)
     RETURNING academic_year, offline_count, is_current, created_at, updated_at`,
    [academicYear],
  );
  return rows[0];
}

export async function setOfflineCount(
  academicYear: string,
  offlineCount: number,
): Promise<RegistrationStats | null> {
  const rows = await sql.unsafe<RegistrationStats[]>(
    `UPDATE registration_stats
     SET offline_count = $1, updated_at = now()
     WHERE academic_year = $2
     RETURNING academic_year, offline_count, is_current, created_at, updated_at`,
    [offlineCount, academicYear],
  );
  return rows[0] ?? null;
}

export async function setCurrent(
  academicYear: string,
): Promise<RegistrationStats> {
  return sql.begin(async (tx) => {
    await tx.unsafe(
      `UPDATE registration_stats SET is_current = false, updated_at = now()
       WHERE is_current`,
    );

    const rows = await tx.unsafe<RegistrationStats[]>(
      `UPDATE registration_stats
       SET is_current = true, updated_at = now()
       WHERE academic_year = $1
       RETURNING academic_year, offline_count, is_current, created_at, updated_at`,
      [academicYear],
    );

    if (!rows[0]) {
      throw new Error(`Tahun ajaran ${academicYear} tidak ditemukan.`);
    }

    return rows[0];
  });
}
