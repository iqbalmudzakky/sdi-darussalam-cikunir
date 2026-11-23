import { sql } from "@/modules/db/postgres";
import type { TransactionSql } from "postgres";
import type { ReceivedDocument } from "@/modules/shared/constant/registration";
import type {
  InsertFullRegistrationInput,
  ListRegistrationsInput,
  NewShortRegistration,
  PpdbRegistrationExportRow,
  PpdbRegistrationFormRow,
  PpdbRegistrationFullRow,
  PpdbRegistrationListItem,
  PpdbRegistrationStatus,
  RegistrantRegionRow,
  RegistrationFilter,
  RegistrationSourceCounts,
  ShortRegistrationIdentity,
  UpdateRegistrationFormInput,
} from "./entity";
import type { CreatePpdbRegistrationRequest, StudentForm } from "./dto";

const LIST_COLUMNS = `
  pr.id, pr.registration_number, pr.registration_type, pr.program,
  pr.target_grade, pr.academic_year, pr.status, pr.contact_name,
  pr.contact_phone, pr.full_form_completed_at, pr.received_documents,
  pr.created_at, ps.full_name
`;

const LIST_FILTER = `
  ($1 = '' OR ps.full_name ILIKE '%' || $1 || '%'
           OR ps.nik ILIKE '%' || $1 || '%'
           OR pr.registration_number ILIKE '%' || $1 || '%')
  AND ($2 = '' OR pr.status = ANY(string_to_array($2, ',')))
  AND ($3 = '' OR pr.academic_year = $3)
  AND ($4 = '' OR pr.program = $4)
  AND ($5 = '' OR pr.registration_type = $5)
`;

const PROFILE_COLUMNS = `
  pr.parent_email, ps.nisn, ps.gender, ps.place_of_birth,
  ps.date_of_birth::text AS date_of_birth, ps.birth_order, ps.sibling_count,
  ps.physical_disability, ps.previous_school
`;

const PROFILE_FROM = `
  FROM ppdb_registrations pr
  JOIN ppdb_registration_students ps ON ps.registration_id = pr.id
`;

const STUDENT_FORM_COLUMNS = `full_name, gender, nik, nisn, place_of_birth,
  date_of_birth, religion, physical_disability, previous_school,
  previous_school_npsn, previous_school_address, address, hamlet, rt_rw,
  village, postal_code, district, city, province, home_phone, phone,
  birth_certificate_number, kks_number, kps_number, kip_number, kip_name,
  latitude, longitude, sibling_count`
  .split(",")
  .map((column) => column.trim()) as (keyof StudentForm)[];

export async function insertWithin(
  tx: TransactionSql,
  input: CreatePpdbRegistrationRequest,
  options: InsertFullRegistrationInput,
): Promise<string> {
  const contact =
    input.parents.find((parent) => parent.parent_type === "father") ??
    input.parents[0];

  const registrationRows = await tx.unsafe<{ id: string }[]>(
    `INSERT INTO ppdb_registrations (
       registration_type, ip_address, parent_email, source, academic_year,
       registration_number, contact_name, contact_phone, full_form_completed_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     RETURNING id`,
    [
      input.registration_type,
      input.ip_address,
      input.parent_email ?? null,
      options.source,
      options.academicYear,
      options.registrationNumber,
      contact?.name ?? null,
      contact?.phone ?? null,
    ],
  );
  const registrationId = registrationRows[0].id;
  await insertStudentWithin(tx, registrationId, input.student);

  return registrationId;
}

export async function existsDuplicateByNik(nik: string): Promise<boolean> {
  const rows = await sql.unsafe(
    `SELECT id FROM ppdb_registration_students WHERE nik = $1 LIMIT 1`,
    [nik],
  );

  return rows.length > 0;
}

export async function nextRegistrationSequenceWithin(
  tx: TransactionSql,
  academicYear: string,
): Promise<number> {
  const lockKey = `registration-number:${academicYear}`;
  await tx.unsafe("SELECT pg_advisory_xact_lock(hashtext($1))", [lockKey]);

  const rows = await tx.unsafe<{ next: number }[]>(
    `SELECT COALESCE(MAX(split_part(registration_number, '-', 2)::int), 0) + 1 AS next
     FROM ppdb_registrations
     WHERE academic_year = $1 AND registration_number IS NOT NULL`,
    [academicYear],
  );
  return rows[0].next;
}

export async function insertShortWithin(
  tx: TransactionSql,
  input: NewShortRegistration,
): Promise<string> {
  const rows = await tx.unsafe<{ id: string }[]>(
    `INSERT INTO ppdb_registrations (
       registration_type, ip_address, parent_email, source, academic_year,
       registration_number, program, target_grade, contact_name, contact_phone
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      input.registrationType,
      input.ipAddress,
      input.parentEmail,
      input.source,
      input.academicYear,
      input.registrationNumber,
      input.program,
      input.targetGrade,
      input.contactName,
      input.contactPhone,
    ],
  );
  const registrationId = rows[0].id;

  await tx.unsafe(
    `INSERT INTO ppdb_registration_students (
       registration_id, full_name, gender, date_of_birth, previous_school
     )
     VALUES ($1, $2, $3, $4, $5)`,
    [
      registrationId,
      input.fullName,
      input.gender,
      input.dateOfBirth,
      input.previousSchool,
    ],
  );
  return registrationId;
}

export async function findFormById(
  id: string,
): Promise<PpdbRegistrationFormRow | null> {
  const studentFields = STUDENT_FORM_COLUMNS.map(
    (column) => `'${column}', ps.${column}`,
  );
  const rows = await sql.unsafe<PpdbRegistrationFormRow[]>(
    `SELECT pr.id, pr.registration_number, pr.registration_type,
            pr.parent_email, pr.contact_phone,
            json_build_object(${studentFields.join(", ")}) AS student
     FROM ppdb_registrations pr
     JOIN ppdb_registration_students ps ON ps.registration_id = pr.id
     WHERE pr.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function existsNikOnOther(
  nik: string,
  registrationId: string,
): Promise<boolean> {
  const rows = await sql.unsafe(
    `SELECT id FROM ppdb_registration_students
     WHERE nik = $1 AND registration_id <> $2
     LIMIT 1`,
    [nik, registrationId],
  );
  return rows.length > 0;
}

export async function updateFormWithin(
  tx: TransactionSql,
  input: UpdateRegistrationFormInput,
): Promise<void> {
  await tx.unsafe(
    `UPDATE ppdb_registrations
     SET parent_email = $2, full_form_completed_at = now(), updated_at = now()
     WHERE id = $1`,
    [input.registrationId, input.parentEmail],
  );

  const assignments = STUDENT_FORM_COLUMNS.map(
    (column, index) => `${column} = $${index + 2}`,
  );
  const values = STUDENT_FORM_COLUMNS.map((column) => input.student[column]);
  await tx.unsafe(
    `UPDATE ppdb_registration_students
     SET ${assignments.join(", ")}, updated_at = now()
     WHERE registration_id = $1`,
    [input.registrationId, ...values],
  );
}

export async function existsShortDuplicate(
  identity: ShortRegistrationIdentity,
): Promise<boolean> {
  const rows = await sql.unsafe(
    `SELECT pr.id
     FROM ppdb_registrations pr
     JOIN ppdb_registration_students ps ON ps.registration_id = pr.id
     WHERE lower(ps.full_name) = lower($1)
       AND ps.date_of_birth = $2
       AND pr.academic_year = $3
       AND pr.status <> 'cancelled'
     LIMIT 1`,
    [identity.fullName, identity.dateOfBirth, identity.academicYear],
  );
  return rows.length > 0;
}

export async function countShortFormsByIpLastHour(
  ipAddress: string,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count
     FROM ppdb_registrations
     WHERE ip_address = $1
       AND full_form_completed_at IS NULL
       AND created_at > now() - interval '1 hour'`,
    [ipAddress],
  );
  return rows[0].count;
}

export async function list(
  input: ListRegistrationsInput,
): Promise<PpdbRegistrationListItem[]> {
  const direction = input.sortDirection === "asc" ? "ASC" : "DESC";

  return sql.unsafe<PpdbRegistrationListItem[]>(
    `SELECT ${LIST_COLUMNS}
     FROM ppdb_registrations pr
     JOIN ppdb_registration_students ps ON ps.registration_id = pr.id
     WHERE ${LIST_FILTER}
     ORDER BY pr.created_at ${direction}
     LIMIT $6
     OFFSET $7`,
    [
      input.search,
      input.statuses.join(","),
      input.academicYear,
      input.program,
      input.registrationType,
      input.limit,
      input.offset,
    ],
  );
}

export async function count(filter: RegistrationFilter): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count
     FROM ppdb_registrations pr
     JOIN ppdb_registration_students ps ON ps.registration_id = pr.id
     WHERE ${LIST_FILTER}`,
    [
      filter.search,
      filter.statuses.join(","),
      filter.academicYear,
      filter.program,
      filter.registrationType,
    ],
  );
  return rows[0].count;
}

export async function listAcademicYears(): Promise<string[]> {
  const rows = await sql.unsafe<{ academic_year: string }[]>(
    `SELECT DISTINCT academic_year
     FROM ppdb_registrations
     WHERE academic_year IS NOT NULL
     ORDER BY academic_year DESC`,
  );
  return rows.map((row) => row.academic_year);
}

export async function findFullById(
  id: string,
): Promise<PpdbRegistrationFullRow | null> {
  const rows = await sql.unsafe<PpdbRegistrationFullRow[]>(
    `SELECT ${LIST_COLUMNS}, pr.ip_address, ps.nik AS student_nik,
            ps.address AS current_address, ${PROFILE_COLUMNS}
     ${PROFILE_FROM}
     WHERE pr.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe("DELETE FROM ppdb_registrations WHERE id = $1", [id]);
}

export async function cancel(id: string): Promise<boolean> {
  const rows = await sql.unsafe(
    `UPDATE ppdb_registrations
     SET status_before_cancel = status,
         status = 'cancelled',
         updated_at = now()
     WHERE id = $1 AND status <> 'cancelled'
     RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

export async function reactivate(id: string): Promise<boolean> {
  const rows = await sql.unsafe(
    `UPDATE ppdb_registrations
     SET status = COALESCE(status_before_cancel, 'new'),
         status_before_cancel = NULL,
         updated_at = now()
     WHERE id = $1 AND status = 'cancelled'
     RETURNING id`,
    [id],
  );
  return rows.length > 0;
}

export async function setReceivedDocuments(
  id: string,
  documents: ReceivedDocument[],
): Promise<void> {
  await sql.unsafe(
    `UPDATE ppdb_registrations
     SET received_documents = string_to_array($1, ','),
         updated_at = now()
     WHERE id = $2`,
    [documents.join(","), id],
  );
}

export async function countByStatus(
  status: PpdbRegistrationStatus,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count
     FROM ppdb_registrations
     WHERE status = $1`,
    [status],
  );
  return rows[0].count;
}

export async function exportList(
  statuses: PpdbRegistrationStatus[],
): Promise<PpdbRegistrationExportRow[]> {
  return sql.unsafe<PpdbRegistrationExportRow[]>(
    `SELECT pr.id, pr.registration_type, pr.status, pr.created_at,
            ps.full_name, ps.nik, ps.address, ${PROFILE_COLUMNS}
     ${PROFILE_FROM}
     WHERE ($1 = '' OR pr.status = ANY(string_to_array($1, ',')))
     ORDER BY pr.created_at DESC`,
    [statuses.join(",")],
  );
}

export async function listRegistrantRegions(
  limit: number,
): Promise<RegistrantRegionRow[]> {
  return sql.unsafe<RegistrantRegionRow[]>(
    `SELECT
       COALESCE(NULLIF(TRIM(ps.city), ''), 'Tidak diisi') AS city,
       COALESCE(NULLIF(TRIM(ps.province), ''), '') AS province,
       COUNT(*)::int AS total
     FROM ppdb_registrations pr
     JOIN ppdb_registration_students ps ON ps.registration_id = pr.id
     GROUP BY 1, 2
     ORDER BY total DESC, city ASC
     LIMIT $1`,
    [limit],
  );
}

export async function countBySourceForYear(
  academicYear: string,
): Promise<RegistrationSourceCounts> {
  const rows = await sql.unsafe<{ online: number; offline_recorded: number }[]>(
    `SELECT
       count(*) FILTER (WHERE source = 'online')::int AS online,
       count(*) FILTER (WHERE source = 'offline')::int AS offline_recorded
     FROM ppdb_registrations
     WHERE academic_year = $1`,
    [academicYear],
  );
  return rows[0] ?? { online: 0, offline_recorded: 0 };
}

export async function countBySourceForAllYears(): Promise<
  Map<string, RegistrationSourceCounts>
> {
  const rows = await sql.unsafe<
    { academic_year: string; online: number; offline_recorded: number }[]
  >(
    `SELECT
       academic_year,
       count(*) FILTER (WHERE source = 'online')::int AS online,
       count(*) FILTER (WHERE source = 'offline')::int AS offline_recorded
     FROM ppdb_registrations
     WHERE academic_year IS NOT NULL
     GROUP BY academic_year`,
  );

  return new Map(
    rows.map((row) => [
      row.academic_year,
      { online: row.online, offline_recorded: row.offline_recorded },
    ]),
  );
}

async function insertStudentWithin(
  tx: TransactionSql,
  registrationId: string,
  student: CreatePpdbRegistrationRequest["student"],
): Promise<void> {
  await tx.unsafe(
    `INSERT INTO ppdb_registration_students (
       registration_id, full_name, nickname, nik, nisn, gender, place_of_birth,
       date_of_birth, address, village, rt_rw, district, city, province, phone,
       birth_order, sibling_count, orphan_status, daily_language, citizenship,
       religion, physical_disability, previous_school, previous_school_transfer
     )
     VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
       $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
     )`,
    [
      registrationId,
      student.full_name,
      student.nickname ?? null,
      student.nik,
      student.nisn ?? null,
      student.gender,
      student.place_of_birth,
      student.date_of_birth,
      student.address,
      student.village ?? null,
      student.rt_rw ?? null,
      student.district ?? null,
      student.city ?? null,
      student.province ?? null,
      student.phone ?? null,
      student.birth_order,
      student.sibling_count,
      student.orphan_status ?? null,
      student.daily_language ?? null,
      student.citizenship,
      student.religion,
      student.physical_disability,
      student.previous_school,
      student.previous_school_transfer ?? null,
    ],
  );
}
