import { sql } from "@/modules/db/postgres";
import type { TransactionSql } from "postgres";
import type {
  ListRegistrationsInput,
  PpdbRegistration,
  PpdbRegistrationExportItem,
  PpdbRegistrationListItem,
  PpdbRegistrationStatus,
  RegistrationFilter,
} from "./entity";
import type { CreatePpdbRegistrationRequest } from "./dto";

const REGISTRATION_COLUMNS = `
  id,
  registration_type,
  status,
  ip_address,
  created_at,
  updated_at
`;

const STUDENT_COLUMNS = `
  id,
  registration_id,
  full_name,
  nickname,
  nik,
  nisn,
  gender,
  place_of_birth,
  date_of_birth,
  address,
  village,
  rt_rw,
  district,
  city,
  province,
  phone,
  birth_order,
  sibling_count,
  orphan_status,
  daily_language,
  citizenship,
  religion,
  physical_disability,
  previous_school,
  previous_school_transfer,
  created_at,
  updated_at
`;

const PARENT_COLUMNS = `
  id,
  registration_id,
  parent_type,
  relationship_status,
  name,
  nik,
  place_of_birth,
  date_of_birth,
  religion,
  education,
  occupation,
  position,
  income,
  citizenship,
  phone,
  created_at,
  updated_at
`;

const DETAIL_COLUMNS = `
  id,
  registration_id,
  living_with,
  distance_to_school,
  owned_vehicle,
  transportation_method,
  talent,
  blood_type,
  height,
  weight,
  head_circumference,
  created_at,
  updated_at
`;

/**
 * Writes a registration and its student/parent/detail rows.
 *
 * Takes an existing transaction so callers that must do more work atomically —
 * settling a DOKU payment, for instance — can join this into their own
 * transaction instead of opening a nested one.
 */
export async function insertWithin(
  tx: TransactionSql,
  input: CreatePpdbRegistrationRequest,
): Promise<string> {
  {
    const registrationRows = await tx.unsafe<{ id: string }[]>(
      `
      INSERT INTO ppdb_registrations (
  registration_type,
  ip_address,
  parent_email
)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [input.registration_type, input.ip_address, input.parent_email ?? null],
    );

    const registrationId = registrationRows[0].id;

    const student = input.student;

    await tx.unsafe(
      `
      INSERT INTO ppdb_registration_students (
        registration_id,
        full_name,
        nickname,
        nik,
        nisn,
        gender,
        place_of_birth,
        date_of_birth,
        address,
        village,
        rt_rw,
        district,
        city,
        province,
        phone,
        birth_order,
        sibling_count,
        orphan_status,
        daily_language,
        citizenship,
        religion,
        physical_disability,
        previous_school,
        previous_school_transfer
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14,
        $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24
      )
      `,
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

    for (const parent of input.parents) {
      await tx.unsafe(
        `
        INSERT INTO ppdb_registration_parents (
          registration_id,
          parent_type,
          relationship_status,
          name,
          nik,
          place_of_birth,
          date_of_birth,
          religion,
          education,
          occupation,
          position,
          income,
          citizenship,
          phone
        )
                VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13, $14
        )
        `,
        [
          registrationId,
          parent.parent_type,
          parent.relationship_status,
          parent.name,
          parent.nik,
          parent.place_of_birth,
          parent.date_of_birth,
          parent.religion ?? null,
          parent.education ?? null,
          parent.occupation ?? null,
          parent.position ?? null,
          parent.income ?? null,
          parent.citizenship ?? null,
          parent.phone,
        ],
      );
    }

    const details = input.details;

    await tx.unsafe(
      `
      INSERT INTO ppdb_registration_details (
        registration_id,
        living_with,
        distance_to_school,
        owned_vehicle,
        transportation_method,
        talent,
        blood_type,
        height,
        weight,
        head_circumference
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10
      )
      `,
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

    return registrationId;
  }
}

export async function insert(
  input: CreatePpdbRegistrationRequest,
): Promise<string> {
  return sql.begin((tx) => insertWithin(tx, input));
}

export async function existsDuplicateByNik(nik: string): Promise<boolean> {
  const rows = await sql.unsafe(
    `
    SELECT id
    FROM ppdb_registration_students
    WHERE nik = $1
    LIMIT 1
    `,
    [nik],
  );

  return rows.length > 0;
}

export async function list(
  input: ListRegistrationsInput,
): Promise<PpdbRegistrationListItem[]> {
  const direction = input.sortDirection === "asc" ? "ASC" : "DESC";

  return sql.unsafe<PpdbRegistrationListItem[]>(
    `
    SELECT
      pr.id,
      pr.registration_type,
      pr.status,
      pr.ip_address,
      pr.parent_email,
      pr.created_at,

      ps.full_name,
      ps.nik AS student_nik,
      ps.gender,
      ps.place_of_birth,
      ps.date_of_birth,
      ps.birth_order,
      ps.sibling_count,
      ps.address AS current_address,
      ps.physical_disability,
      ps.previous_school,
      ps.nisn,

      father.relationship_status AS father_status,
      father.name AS father_name,
      father.nik AS father_nik,
      father.place_of_birth AS father_place_of_birth,
      father.date_of_birth AS father_date_of_birth,
      father.phone AS father_phone,
      father.income AS father_income,

      mother.relationship_status AS mother_status,
      mother.name AS mother_name,
      mother.nik AS mother_nik,
      mother.place_of_birth AS mother_place_of_birth,
      mother.date_of_birth AS mother_date_of_birth,
      mother.phone AS mother_phone,
      mother.income AS mother_income,

      payment.status AS payment_status,
      payment.amount AS payment_amount,
      payment.paid_at,
      payment.invoice_number

    FROM ppdb_registrations pr

    JOIN ppdb_registration_students ps
      ON ps.registration_id = pr.id

    LEFT JOIN ppdb_registration_parents father
      ON father.registration_id = pr.id
      AND father.parent_type = 'father'

    LEFT JOIN ppdb_registration_parents mother
      ON mother.registration_id = pr.id
      AND mother.parent_type = 'mother'

    LEFT JOIN registration_payments payment
      ON payment.registration_id = pr.id

    WHERE ($1 = '' OR ps.full_name ILIKE '%' || $1 || '%')
      AND ($2 = '' OR pr.status = ANY(string_to_array($2, ',')))

    ORDER BY pr.created_at ${direction}

    LIMIT $3
    OFFSET $4
    `,
    [input.search, input.statuses.join(","), input.limit, input.offset],
  );
}

export async function count(filter: RegistrationFilter): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `
    SELECT COUNT(*)::int AS count

    FROM ppdb_registrations pr

    JOIN ppdb_registration_students ps
      ON ps.registration_id = pr.id

    LEFT JOIN ppdb_registration_parents father
      ON father.registration_id = pr.id
      AND father.parent_type = 'father'

    LEFT JOIN ppdb_registration_parents mother
      ON mother.registration_id = pr.id
      AND mother.parent_type = 'mother'

    LEFT JOIN registration_payments payment
      ON payment.registration_id = pr.id

    WHERE ($1 = '' OR ps.full_name ILIKE '%' || $1 || '%')
      AND ($2 = '' OR pr.status = ANY(string_to_array($2, ',')))
    `,
    [filter.search, filter.statuses.join(",")],
  );

  return rows[0].count;
}

export async function remove(id: string): Promise<void> {
  await sql.unsafe(
    `
    DELETE FROM ppdb_registrations
    WHERE id = $1
    `,
    [id],
  );
}

export async function updateStatus(
  id: string,
  status: PpdbRegistrationStatus,
): Promise<PpdbRegistration> {
  const rows = await sql.unsafe(
    `
    UPDATE ppdb_registrations
    SET status = $1,
        updated_at = now()
    WHERE id = $2

    RETURNING ${REGISTRATION_COLUMNS}
    `,
    [status, id],
  );

  return rows[0] as unknown as PpdbRegistration;
}

export async function countByStatus(
  status: PpdbRegistrationStatus,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `
    SELECT COUNT(*)::int AS count
    FROM ppdb_registrations
    WHERE status = $1
    `,
    [status],
  );

  return rows[0].count;
}

export async function exportList(
  statuses: PpdbRegistrationStatus[],
): Promise<PpdbRegistrationExportItem[]> {
  return sql.unsafe<PpdbRegistrationExportItem[]>(
    `
    SELECT
      pr.id,
      pr.registration_type,
      pr.status,
      pr.created_at,
      pr.parent_email,

      ps.full_name,
      ps.nik,
      ps.nisn,
      ps.gender,
      ps.place_of_birth,
      ps.date_of_birth,
      ps.birth_order,
      ps.sibling_count,
      ps.address,
      ps.physical_disability,
      ps.previous_school,


      father.relationship_status AS father_status,
      father.name AS father_name,
      father.nik AS father_nik,
      father.place_of_birth AS father_place_of_birth,
      father.date_of_birth AS father_date_of_birth,
      father.phone AS father_phone,
      father.income AS father_income,


      mother.relationship_status AS mother_status,
      mother.name AS mother_name,
      mother.nik AS mother_nik,
      mother.place_of_birth AS mother_place_of_birth,
      mother.date_of_birth AS mother_date_of_birth,
      mother.phone AS mother_phone,
      mother.income AS mother_income,

      payment.status AS payment_status,
      payment.amount AS payment_amount,
      payment.paid_at,
      payment.invoice_number

    FROM ppdb_registrations pr

    JOIN ppdb_registration_students ps
      ON ps.registration_id = pr.id

    LEFT JOIN ppdb_registration_parents father
      ON father.registration_id = pr.id
      AND father.parent_type = 'father'

    LEFT JOIN ppdb_registration_parents mother
      ON mother.registration_id = pr.id
      AND mother.parent_type = 'mother'

    LEFT JOIN registration_payments payment
      ON payment.registration_id = pr.id

    WHERE ($1 = '' OR pr.status = ANY(string_to_array($1, ',')))

    ORDER BY pr.created_at DESC
    `,
    [statuses.join(",")],
  );
}
