import { randomBytes } from "node:crypto";
import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import { createCheckoutSession } from "./doku";
import { getRegistrationFee } from "@/modules/payment-settings/service";
import type { DokuNotification, PaymentStatus, RegistrationPayload } from "./entity";

/** Sessions that reached a decision — paid, failed or expired. */
const RATE_LIMIT_MAX_PER_HOUR = 3;
/** Backstop covering abandoned sessions too, so they cannot be created freely. */
const RATE_LIMIT_MAX_SESSIONS_PER_HOUR = 15;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export type StartPaymentResult =
  | { ok: true; paymentUrl: string; invoiceNumber: string }
  | {
      ok: false;
      reason: "rate_limited" | "duplicate" | "gateway_error";
      message: string;
    };

/**
 * Invoice numbers must be unique and stay within 30 characters for the Credit
 * Card channel. `PPDB-` + 8 date digits + `-` + 8 random hex characters is 22,
 * which leaves the date readable in DOKU's dashboard while the random suffix
 * makes collisions implausible.
 */
function generateInvoiceNumber(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `PPDB-${date}-${suffix}`;
}

export async function startRegistrationPayment(input: {
  payload: RegistrationPayload;
  ipAddress: string;
  request?: Request;
}): Promise<StartPaymentResult> {
  // Manual testing means paying over and over from one machine, which is
  // exactly the pattern this guard exists to stop. Skipping it in development
  // keeps the limits intact where they matter, in production.
  if (process.env.NODE_ENV !== "development") {
    const sessionCount = await withDbLogging("payment.countAllByIpSince", () =>
      repository.countAllByIpSince(input.ipAddress, RATE_LIMIT_WINDOW_MINUTES),
    );
    const recentCount = await withDbLogging("payment.countByIpSince", () =>
      repository.countByIpSince(input.ipAddress, RATE_LIMIT_WINDOW_MINUTES),
    );
    if (
      recentCount >= RATE_LIMIT_MAX_PER_HOUR ||
      sessionCount >= RATE_LIMIT_MAX_SESSIONS_PER_HOUR
    ) {
      return {
        ok: false,
        reason: "rate_limited",
        message: "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
      };
    }
  }

  const isDuplicate = await withDbLogging("payment.existsPaidDuplicate", () =>
    repository.existsPaidDuplicate(
      input.payload.student.full_name,
      input.payload.student.date_of_birth,
    ),
  );
  if (isDuplicate) {
    return {
      ok: false,
      reason: "duplicate",
      message:
        "Pendaftaran atas nama ini sudah terbayar. Silakan hubungi kami jika ada kendala.",
    };
  }

  const amount = await getRegistrationFee();
  const invoiceNumber = generateInvoiceNumber();

  const payment = await withDbLogging("payment.insert", () =>
    repository.insert({
      invoice_number: invoiceNumber,
      amount,
      payload: input.payload,
      ip_address: input.ipAddress,
    }),
  );

  const result = await createCheckoutSession({
    invoiceNumber,
    amount,
    payload: input.payload,
    request: input.request,
  });

  if (!result.ok) {
    // Leave the row as pending: it is the audit trail of the failed attempt,
    // and the applicant simply submits again.
    return { ok: false, reason: "gateway_error", message: result.message };
  }

  await withDbLogging("payment.attachSession", () =>
    repository.attachSession(payment.id, result.session),
  );

  return {
    ok: true,
    paymentUrl: result.session.paymentUrl,
    invoiceNumber,
  };
}

export type NotificationOutcome =
  | "settled"
  | "duplicate"
  | "ignored"
  | "unknown_invoice";

/**
 * Applies a verified DOKU notification.
 *
 * Per the Checkout integration guide, a FAILED status must be ignored: the
 * checkout page lets the customer retry with another method, so a failure on
 * one channel is not final and a later SUCCESS may still arrive.
 */
export async function applyNotification(
  requestId: string,
  body: DokuNotification,
): Promise<NotificationOutcome> {
  const invoiceNumber = body.order?.invoice_number ?? null;
  const transactionStatus = body.transaction?.status ?? null;

  const isNew = await withDbLogging("payment.recordNotificationEvent", () =>
    repository.recordNotificationEvent({
      requestId,
      invoiceNumber,
      transactionStatus,
      body,
    }),
  );
  if (!isNew) return "duplicate";

  if (transactionStatus !== "SUCCESS" || !invoiceNumber) return "ignored";

  const payment = await withDbLogging("payment.findByInvoiceNumber", () =>
    repository.findByInvoiceNumber(invoiceNumber),
  );
  if (!payment) return "unknown_invoice";

  const registrationId = await withDbLogging("payment.settleAsRegistration", () =>
    repository.settleAsRegistration(payment, {
      paymentMethod: body.channel?.id ?? body.service?.id ?? null,
      acquirer: body.acquirer?.id ?? null,
      paidAt: body.transaction?.date ?? new Date().toISOString(),
    }),
  );

  return registrationId ? "settled" : "duplicate";
}

export type PaymentStatusView = {
  invoice_number: string;
  status: PaymentStatus;
  amount: number;
  full_name: string;
};

export async function getPaymentStatus(
  invoiceNumber: string,
): Promise<PaymentStatusView | null> {
  const payment = await withDbLogging("payment.findByInvoiceNumber", () =>
    repository.findByInvoiceNumber(invoiceNumber),
  );
  if (!payment) return null;

  return {
    invoice_number: payment.invoice_number,
    status: payment.status,
    amount: payment.amount,
    full_name: payment.payload.student.full_name,
  };
}
