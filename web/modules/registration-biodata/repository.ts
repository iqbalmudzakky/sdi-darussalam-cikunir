import type { TransactionSql } from "postgres";
import { sql } from "@/modules/db/postgres";
import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";
import type { BiodataForm } from "./dto";
import type {
  AchievementRow,
  DetailsFormRow,
  ParentFormRow,
  RegistrationParentRow,
} from "./entity";

export async function listParentsByRegistrationIds(
  registrationIds: string[],
): Promise<RegistrationParentRow[]> {
  return sql.unsafe<RegistrationParentRow[]>(
    `SELECT registration_id, parent_type, name, nik, birth_year, special_needs,
            occupation, education, income_range, phone, relationship_status,
            place_of_birth, date_of_birth::text AS date_of_birth, income
     FROM ppdb_registration_parents
     WHERE registration_id = ANY(string_to_array($1, ',')::uuid[])`,
    [registrationIds.join(",")],
  );
}

export async function listFormParents(
  registrationId: string,
): Promise<ParentFormRow[]> {
  return sql.unsafe<ParentFormRow[]>(
    `SELECT parent_type, name, nik,
            COALESCE(birth_year, EXTRACT(YEAR FROM date_of_birth)::int) AS birth_year,
            special_needs, occupation, education, income_range, phone
     FROM ppdb_registration_parents
     WHERE registration_id = $1`,
    [registrationId],
  );
}

export async function findFormDetails(
  registrationId: string,
): Promise<DetailsFormRow | null> {
  const rows = await sql.unsafe<DetailsFormRow[]>(
    `SELECT living_with, transportation_method, height, weight,
            CASE WHEN distance_to_school ~ '^[0-9]+(\\.[0-9]+)?$'
                 THEN distance_to_school::float8 END AS distance_km,
            travel_time_minutes
     FROM ppdb_registration_details
     WHERE registration_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [registrationId],
  );
  return rows[0] ?? null;
}

export async function listAchievements(
  registrationId: string,
): Promise<AchievementRow[]> {
  return sql.unsafe<AchievementRow[]>(
    `SELECT category, level, name, year, organizer
     FROM ppdb_registration_achievements
     WHERE registration_id = $1
     ORDER BY created_at`,
    [registrationId],
  );
}

export async function replaceParentsWithin(
  tx: TransactionSql,
  registrationId: string,
  form: BiodataForm,
): Promise<void> {
  await tx.unsafe(
    "DELETE FROM ppdb_registration_parents WHERE registration_id = $1",
    [registrationId],
  );

  const parents = [
    { parent_type: "father", ...form.father },
    { parent_type: "mother", ...form.mother },
    ...(form.guardian ? [{ parent_type: "guardian", ...form.guardian }] : []),
  ];
  await tx.unsafe(
    `INSERT INTO ppdb_registration_parents (
       registration_id, parent_type, name, nik, birth_year, special_needs,
       occupation, education, income_range, phone
     )
     SELECT $1::uuid, parent.*
     FROM jsonb_to_recordset($2::jsonb) AS parent(
       parent_type text, name text, nik text, birth_year smallint,
       special_needs text, occupation text, education text,
       income_range text, phone text
     )`,
    [registrationId, JSON.stringify(parents)],
  );
}

export async function replaceDetailsWithin(
  tx: TransactionSql,
  registrationId: string,
  details: BiodataForm["details"],
): Promise<void> {
  await tx.unsafe(
    "DELETE FROM ppdb_registration_details WHERE registration_id = $1",
    [registrationId],
  );
  await tx.unsafe(
    `INSERT INTO ppdb_registration_details (
       registration_id, living_with, transportation_method, distance_to_school,
       travel_time_minutes, height, weight
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      registrationId,
      details.living_with,
      details.transportation_method,
      String(details.distance_km),
      details.travel_time_minutes,
      details.height,
      details.weight,
    ],
  );
}

export async function replaceAchievementsWithin(
  tx: TransactionSql,
  registrationId: string,
  achievements: BiodataForm["achievements"],
): Promise<void> {
  await tx.unsafe(
    "DELETE FROM ppdb_registration_achievements WHERE registration_id = $1",
    [registrationId],
  );
  await tx.unsafe(
    `INSERT INTO ppdb_registration_achievements (
       registration_id, category, level, name, year, organizer
     )
     SELECT $1::uuid, achievement.*
     FROM jsonb_to_recordset($2::jsonb) AS achievement(
       category text, level text, name text, year smallint, organizer text
     )`,
    [registrationId, JSON.stringify(achievements)],
  );
}

export async function insertLegacyParentsWithin(
  tx: TransactionSql,
  registrationId: string,
  parents: CreatePpdbRegistrationRequest["parents"],
): Promise<void> {
  await tx.unsafe(
    `INSERT INTO ppdb_registration_parents (
       registration_id, parent_type, relationship_status, name, nik,
       place_of_birth, date_of_birth, religion, education, occupation,
       position, income, citizenship, phone
     )
     SELECT $1::uuid, parent.*
     FROM jsonb_to_recordset($2::jsonb) AS parent(
       parent_type text, relationship_status text, name text, nik text,
       place_of_birth text, date_of_birth date, religion text, education text,
       occupation text, position text, income integer, citizenship text,
       phone text
     )`,
    [registrationId, JSON.stringify(parents)],
  );
}

export async function insertLegacyDetailsWithin(
  tx: TransactionSql,
  registrationId: string,
  details: CreatePpdbRegistrationRequest["details"],
): Promise<void> {
  await tx.unsafe(
    `INSERT INTO ppdb_registration_details (
       registration_id, living_with, distance_to_school, owned_vehicle,
       transportation_method, talent, blood_type, height, weight,
       head_circumference
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [
      registrationId,
      details.living_with ?? null,
      details.distance_to_school ?? null,
      details.owned_vehicle ?? null,
      details.transportation_method ?? null,
      details.talent ?? null,
      details.blood_type ?? null,
      details.height ?? null,
      details.weight ?? null,
      details.head_circumference ?? null,
    ],
  );
}
