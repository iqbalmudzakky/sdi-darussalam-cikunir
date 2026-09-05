import { sql } from "@/modules/db/postgres";
import type { CheckoutSession } from "./doku";
import type {
  DokuNotification,
  ListPaymentsInput,
  NewManualPayment,
  NewRegistrationPayment,
  PaymentFilter,
  PaymentStatus,
  RegistrationPayment,
  RegistrationPaymentListItem,
} from "./entity";
import * as registrationRepository from "@/modules/registration/repository";

const COLUMNS = `
  id, invoice_number, amount, status, source, payload, registration_id,
  session_id, token_id, payment_url, expired_date,
  payment_method, acquirer, receipt_number, paid_at, ip_address,
  created_at, updated_at
`;

export async function insert(
  input: NewRegistrationPayment,
): Promise<RegistrationPayment> {
  const rows = await sql.unsafe<RegistrationPayment[]>(
    `INSERT INTO registration_payments (invoice_number, amount, payload, ip_address)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNS}`,
    // postgres.js serialises the object into jsonb itself — passing a
    // pre-stringified value would store a JSON *string* rather than an object.
    [input.invoice_number, input.amount, input.payload, input.ip_address],
  );
  return rows[0];
}

export async function attachSession(
  id: string,
  session: CheckoutSession,
): Promise<void> {
  await sql.unsafe(
    `UPDATE registration_payments
     SET session_id = $1, token_id = $2, payment_url = $3, expired_date = $4,
         updated_at = now()
     WHERE id = $5`,
    [
      session.sessionId,
      session.tokenId,
      session.paymentUrl,
      session.expiredDate,
      id,
    ],
  );
}

export async function findByInvoiceNumber(
  invoiceNumber: string,
): Promise<RegistrationPayment | null> {
  const rows = await sql.unsafe<RegistrationPayment[]>(
    `SELECT ${COLUMNS} FROM registration_payments WHERE invoice_number = $1`,
    [invoiceNumber],
  );
  return rows[0] ?? null;
}

export async function list(
  input: ListPaymentsInput,
): Promise<RegistrationPaymentListItem[]> {
  const direction = input.sortDirection === "asc" ? "ASC" : "DESC";

  return sql.unsafe<RegistrationPaymentListItem[]>(
    `
    SELECT
      p.id,
      p.invoice_number,
      p.amount,
      p.status,
      p.source,
      p.registration_id,
      p.payment_method,
      p.acquirer,
      p.receipt_number,
      p.paid_at,
      p.expired_date,
      p.created_at,

      p.payload -> 'student' ->> 'full_name' AS full_name,
      p.payload -> 'student' ->> 'nik'       AS student_nik,
      p.payload ->> 'parent_email'           AS parent_email,

      (SELECT parent ->> 'phone'
         FROM jsonb_array_elements(COALESCE(p.payload -> 'parents', '[]'::jsonb)) AS parent
        WHERE parent ->> 'parent_type' = 'father'
        LIMIT 1) AS father_phone,

      (SELECT parent ->> 'phone'
         FROM jsonb_array_elements(COALESCE(p.payload -> 'parents', '[]'::jsonb)) AS parent
        WHERE parent ->> 'parent_type' = 'mother'
        LIMIT 1) AS mother_phone

    FROM registration_payments p

    WHERE ($1 = '' OR p.invoice_number ILIKE '%' || $1 || '%'
                   OR p.payload -> 'student' ->> 'full_name' ILIKE '%' || $1 || '%'
                   OR p.payload -> 'student' ->> 'nik' ILIKE '%' || $1 || '%')
      AND ($2 = '' OR p.status::text = ANY(string_to_array($2, ',')))

    ORDER BY p.created_at ${direction}

    LIMIT $3
    OFFSET $4
    `,
    [input.search, input.statuses.join(","), input.limit, input.offset],
  );
}

export async function count(filter: PaymentFilter): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `
    SELECT COUNT(*)::int AS count

    FROM registration_payments p

    WHERE ($1 = '' OR p.invoice_number ILIKE '%' || $1 || '%'
                   OR p.payload -> 'student' ->> 'full_name' ILIKE '%' || $1 || '%'
                   OR p.payload -> 'student' ->> 'nik' ILIKE '%' || $1 || '%')
      AND ($2 = '' OR p.status::text = ANY(string_to_array($2, ',')))
    `,
    [filter.search, filter.statuses.join(",")],
  );

  return rows[0].count;
}

/* Menghitung semua sesi dari satu IP, termasuk yang ditinggalkan. Penjaga
 * cadangan supaya sesi tidak bisa dibuat tanpa batas. */
export async function countAllByIpSince(
  ip: string,
  minutesAgo: number,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count
     FROM registration_payments
     WHERE ip_address = $1
       AND created_at > now() - ($2 || ' minutes')::interval`,
    [ip, minutesAgo],
  );
  return rows[0].count;
}

/* Hanya sesi yang sudah berakhir (lunas/gagal/kedaluwarsa) yang dihitung.
 * Membuka halaman DOKU lalu batal itu wajar dan tidak boleh mengunci orang. */
export async function countByIpSince(
  ip: string,
  minutesAgo: number,
): Promise<number> {
  const rows = await sql.unsafe<{ count: number }[]>(
    `SELECT COUNT(*)::int AS count
     FROM registration_payments
     WHERE ip_address = $1
       AND status <> 'pending'
       AND created_at > now() - ($2 || ' minutes')::interval`,
    [ip, minutesAgo],
  );
  return rows[0].count;
}

/**
 * A pendaftar counts as already registered only once they have paid — an
 * abandoned checkout must not block them from trying again.
 *
 * Dicek lewat NIK, sama seperti penjagaan duplikat di jalur input manual: NIK
 * unik per orang, sedangkan nama + tanggal lahir bisa kebetulan sama pada dua
 * anak yang berbeda.
 */
export async function existsPaidDuplicate(nik: string): Promise<boolean> {
  /* Biodata ada di payload -> 'student', mengikuti DTO PPDB. */
  const rows = await sql.unsafe(
    `SELECT id
     FROM registration_payments
     WHERE status = 'success'
       AND payload -> 'student' ->> 'nik' = $1
     LIMIT 1`,
    [nik],
  );
  return rows.length > 0;
}

export async function markFailed(
  invoiceNumber: string,
  status: Extract<PaymentStatus, "failed" | "expired">,
): Promise<void> {
  await sql.unsafe(
    `UPDATE registration_payments
     SET status = $1, updated_at = now()
     WHERE invoice_number = $2 AND status = 'pending'`,
    [status, invoiceNumber],
  );
}

/*
 * Memindahkan pendaftaran yang sudah dibayar ke tabel ppdb_* dalam satu
 * transaksi, supaya tidak ada pembayaran sukses tanpa data pendaftaran.
 * Mengembalikan null kalau sudah pernah diselesaikan.
 */
export async function settleAsRegistration(
  payment: RegistrationPayment,
  details: {
    paymentMethod: string | null;
    acquirer: string | null;
    paidAt: string;
  },
): Promise<string | null> {
  return sql.begin(async (tx) => {
    const claimed = await tx.unsafe<{ id: string }[]>(
      `UPDATE registration_payments
       SET status = 'success', payment_method = $1, acquirer = $2,
           paid_at = $3, updated_at = now()
       WHERE id = $4 AND status <> 'success'
       RETURNING id`,
      [details.paymentMethod, details.acquirer, details.paidAt, payment.id],
    );

    if (claimed.length === 0) return null;

    /* Memakai insert milik modul registration supaya tidak pernah berbeda. */
    const registrationId = await registrationRepository.insertWithin(tx, {
      ...payment.payload,
      ip_address: payment.ip_address ?? "unknown",
    });

    await tx.unsafe(
      `UPDATE registration_payments SET registration_id = $1 WHERE id = $2`,
      [registrationId, payment.id],
    );

    return registrationId;
  });
}

export async function insertManual(
  input: NewManualPayment,
): Promise<{ registrationId: string; payment: RegistrationPayment }> {
  return sql.begin(async (tx) => {
    const registrationId = await registrationRepository.insertWithin(tx, {
      ...input.payload,
      ip_address: input.ipAddress ?? "unknown",
    });

    const rows = await tx.unsafe<RegistrationPayment[]>(
      `INSERT INTO registration_payments
         (invoice_number, amount, status, source, payload, registration_id,
          payment_method, receipt_number, paid_at, ip_address)
       VALUES ($1, $2, 'success', 'manual', $3, $4, $5, $6, $7, $8)
       RETURNING ${COLUMNS}`,
      [
        input.invoiceNumber,
        input.amount,
        input.payload,
        registrationId,
        input.paymentMethod,
        input.receiptNumber,
        input.paidAt,
        input.ipAddress,
      ],
    );

    return { registrationId, payment: rows[0] };
  });
}

/* Mencatat notifikasi. false berarti Request-Id sudah pernah masuk. */
export async function recordNotificationEvent(input: {
  requestId: string;
  invoiceNumber: string | null;
  transactionStatus: string | null;
  body: DokuNotification;
}): Promise<boolean> {
  const rows = await sql.unsafe(
    `INSERT INTO doku_notification_events
       (request_id, invoice_number, transaction_status, body)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (request_id) DO NOTHING
     RETURNING id`,
    [input.requestId, input.invoiceNumber, input.transactionStatus, input.body],
  );
  return rows.length > 0;
}
