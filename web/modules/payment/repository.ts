import { sql } from "@/modules/db/postgres";
import type {
  CheckoutSession,
} from "./doku";
import type {
  DokuNotification,
  NewRegistrationPayment,
  PaymentStatus,
  RegistrationPayment,
} from "./entity";
import * as registrationRepository from "@/modules/registration/repository";

const COLUMNS = `
  id, invoice_number, amount, status, payload, registration_id,
  session_id, token_id, payment_url, expired_date,
  payment_method, acquirer, paid_at, ip_address, created_at, updated_at
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

export async function countByIpSince(
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

/**
 * A pendaftar counts as already registered only once they have paid — an
 * abandoned checkout must not block them from trying again.
 */
export async function existsPaidDuplicate(
  fullName: string,
  dateOfBirth: string,
): Promise<boolean> {
  // The biodata now sits under payload -> 'student', matching the PPDB DTO.
  const rows = await sql.unsafe(
    `SELECT id
     FROM registration_payments
     WHERE status = 'success'
       AND lower(payload -> 'student' ->> 'full_name') = lower($1)
       AND payload -> 'student' ->> 'date_of_birth' = $2
     LIMIT 1`,
    [fullName, dateOfBirth],
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

/**
 * Promotes a paid submission into the PPDB registration tables and links the
 * payment to it, all in one transaction — so a crash midway can never leave a
 * payment marked success without its registration, or the reverse.
 *
 * Returns null when the payment was already settled: the guard in the UPDATE
 * makes a concurrent duplicate notification a no-op rather than a second
 * registration.
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

    // Reuses the registration module's own insert so the two paths can never
    // drift apart as the PPDB schema evolves.
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

/**
 * Records a notification for replay protection. Returns false when DOKU's
 * Request-Id has been seen before, in which case the caller should skip
 * processing and simply acknowledge.
 */
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
