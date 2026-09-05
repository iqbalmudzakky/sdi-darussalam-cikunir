import { randomBytes } from "node:crypto";
import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import * as registrationService from "@/modules/registration/service";
import { createCheckoutSession } from "./doku";
import { getRegistrationFee } from "@/modules/payment-settings/service";
import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";
import type {
  DokuNotification,
  ListPaymentsInput,
  NewManualPayment,
  PaymentFilter,
  PaymentStatus,
  RegistrationPayload,
  RegistrationPaymentListItem,
} from "./entity";
import type {
  CreateManualRegistrationWithPaymentResult,
  ListPaymentsRequest,
  ManualPaymentRequest,
  PaymentListItemResponse,
  PaymentListResponse,
} from "./dto";

/* Sesi yang sudah berakhir: lunas, gagal, atau kedaluwarsa. */
const RATE_LIMIT_MAX_PER_HOUR = 3;
/* Batas cadangan, termasuk sesi yang ditinggalkan. */
const RATE_LIMIT_MAX_SESSIONS_PER_HOUR = 15;
const RATE_LIMIT_WINDOW_MINUTES = 60;

export type StartPaymentResult =
  | { ok: true; paymentUrl: string; invoiceNumber: string }
  | {
      ok: false;
      reason: "rate_limited" | "duplicate" | "gateway_error";
      message: string;
    };

/* Maksimal 30 karakter agar diterima channel kartu kredit. */
function generateInvoiceNumber(
  prefix: "PPDB" | "MANUAL",
  now = new Date(),
): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${date}-${suffix}`;
}

export async function startRegistrationPayment(input: {
  payload: RegistrationPayload;
  ipAddress: string;
  request?: Request;
}): Promise<StartPaymentResult> {
  /* Dilewati saat development: menguji pembayaran berarti membayar berulang
   * dari satu mesin, persis pola yang hendak dicegah. */
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

  const nik = input.payload.student.nik;

  const [isPaidDuplicate, isAlreadyRegistered] = await Promise.all([
    withDbLogging("payment.existsPaidDuplicate", () =>
      repository.existsPaidDuplicate(nik),
    ),
    registrationService.existsDuplicateByNik(nik),
  ]);

  if (isPaidDuplicate || isAlreadyRegistered) {
    return {
      ok: false,
      reason: "duplicate",
      message:
        "Pendaftaran dengan NIK ini sudah terdaftar. Silakan hubungi kami jika ada kendala.",
    };
  }

  const amount = await getRegistrationFee();
  const invoiceNumber = generateInvoiceNumber("PPDB");

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
    /* Dibiarkan pending sebagai jejak percobaan yang gagal. */
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

/*
 * Status FAILED sengaja diabaikan: halaman Checkout membolehkan pendaftar
 * mengganti metode, jadi gagal di satu channel belum tentu final.
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

  const registrationId = await withDbLogging(
    "payment.settleAsRegistration",
    () =>
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

function toPaymentListItemResponse(
  item: RegistrationPaymentListItem,
): PaymentListItemResponse {
  return {
    id: item.id,
    invoice_number: item.invoice_number,
    amount: item.amount,
    status: item.status,
    source: item.source,
    payment_method: item.payment_method,
    acquirer: item.acquirer,
    receipt_number: item.receipt_number,
    paid_at: item.paid_at,
    expired_date: item.expired_date,
    created_at: item.created_at,

    full_name: item.full_name,
    student_nik: item.student_nik,
    parent_email: item.parent_email,
    father_phone: item.father_phone,
    mother_phone: item.mother_phone,

    is_settled: item.registration_id !== null,
  };
}

export async function createManualRegistrationWithPayment(
  registrationInput: CreatePpdbRegistrationRequest,
  paymentInput: ManualPaymentRequest,
): Promise<CreateManualRegistrationWithPaymentResult> {
  const nik = registrationInput.student.nik;

  const isDuplicate = await registrationService.existsDuplicateByNik(nik);
  if (isDuplicate) {
    return {
      ok: false,
      reason: "duplicate",
      message: "NIK ini sudah terdaftar atas nama pendaftar lain.",
    };
  }

  const { ip_address, ...payload } = registrationInput;

  const insertInput: NewManualPayment = {
    invoiceNumber: generateInvoiceNumber("MANUAL"),
    amount: paymentInput.amount,
    payload,
    ipAddress: ip_address,
    paymentMethod: paymentInput.payment_method,
    receiptNumber: paymentInput.receipt_number,
    paidAt: paymentInput.paid_at,
  };

  const { registrationId } = await withDbLogging("payment.insertManual", () =>
    repository.insertManual(insertInput),
  );

  return { ok: true, registration_id: registrationId };
}

export async function listPayments(
  params: ListPaymentsRequest,
): Promise<PaymentListResponse> {
  const filter: PaymentFilter = {
    search: params.search,
    statuses: params.statuses,
  };

  const listInput: ListPaymentsInput = {
    ...filter,
    sortDirection: params.sort,
    limit: params.limit,
    offset: params.offset,
  };

  const [items, total] = await Promise.all([
    withDbLogging("payment.list", () => repository.list(listInput)),
    withDbLogging("payment.count", () => repository.count(filter)),
  ]);

  return {
    items: items.map(toPaymentListItemResponse),
    total,
    has_more: params.offset + items.length < total,
  };
}
