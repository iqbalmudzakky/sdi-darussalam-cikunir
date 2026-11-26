import { randomBytes } from "node:crypto";
import { withDbLogging } from "@/modules/db/errors";
import { withTransaction } from "@/modules/db/postgres";
import * as repository from "./repository";
import * as registrationIntakeService from "@/modules/registration-intake/service";
import * as registrationService from "@/modules/registration/service";
import { createCheckoutSession } from "./doku";
import type { SessionUser } from "@/modules/auth/dto";
import * as authService from "@/modules/auth/service";
import { getRegistrationFee } from "@/modules/payment-settings/service";
import { sendPaymentReceiptEmail } from "@/modules/email/email";
import { buildAdminUrl } from "@/modules/shared/web/siteUrl";
import { toStaffName } from "@/modules/shared/format/staffName";
import { buildWhatsAppLink } from "@/modules/shared/web/whatsapp";
import type {
  DokuNotification,
  FeePaymentRow,
  ListPaymentsInput,
  NewFeePayment,
  NewManualPayment,
  PaymentFilter,
  PaymentStatus,
  RegistrationPayload,
  RegistrationPayment,
  RegistrationPaymentListItem,
  RegistrationPaymentSummaries,
  PaymentSnapshot,
  SettlementDetails,
} from "./entity";
import type {
  ListPaymentsRequest,
  MarkPaidInput,
  PaymentActionFailureReason,
  PaymentLinkResult,
  PaymentViewResponse,
  PaymentListItemResponse,
  PaymentListResponse,
  PaymentRevenueSummaryResponse,
  RevenueSummaryRequest,
} from "./dto";

/* Maksimal 30 karakter agar diterima channel kartu kredit. */
function generateInvoiceNumber(
  prefix: "PPDB" | "MANUAL",
  now = new Date(),
): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${date}-${suffix}`;
}

async function settleAsRegistration(
  payment: RegistrationPayment,
  details: SettlementDetails,
): Promise<string | null> {
  return withTransaction(async (tx) => {
    const claimed = await repository.claimForSettlementWithin(
      tx,
      payment.id,
      details,
    );
    if (!claimed) return null;
    if (payment.registration_id) return payment.registration_id;

    const registrationInput = {
      ...(payment.payload as RegistrationPayload),
      ip_address: payment.ip_address ?? "unknown",
    };

    const registrationId =
      await registrationIntakeService.insertFullRegistrationWithin(
        tx,
        registrationInput,
        "online",
      );

    await repository.attachRegistrationIdWithin(tx, payment.id, registrationId);

    return registrationId;
  });
}

export type NotificationOutcome =
  "settled" | "duplicate" | "ignored" | "unknown_invoice";

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

  if (!isNew && transactionStatus === "SUCCESS") {
    console.warn(
      `[doku] notification SUCCESS diulang untuk invoice ${invoiceNumber} (request ${requestId})`,
    );
  }

  if (transactionStatus !== "SUCCESS" || !invoiceNumber) {
    return isNew ? "ignored" : "duplicate";
  }

  const payment = await withDbLogging("payment.findByInvoiceNumber", () =>
    repository.findByInvoiceNumber(invoiceNumber),
  );
  if (!payment) return "unknown_invoice";

  const paidAt = body.transaction?.date ?? new Date().toISOString();
  const paymentMethod = body.channel?.id ?? body.service?.id ?? null;

  const settlementDetails = {
    paymentMethod,
    acquirer: body.acquirer?.id ?? null,
    paidAt,
  };

  const registrationId = await withDbLogging(
    "payment.settleAsRegistration",
    () => settleAsRegistration(payment, settlementDetails),
  );

  // Cuma sekali: retry DOKU untuk pembayaran yang sudah settled tidak dikirim.
  if (registrationId && payment.payload.parent_email) {
    const receiptInput = {
      to: payment.payload.parent_email,
      studentName: payment.payload.student.full_name,
      paymentMethod,
      logoUrl: buildAdminUrl("/logo.png"),
      invoiceNumber: payment.invoice_number,
      amount: payment.amount,
      paidAt,
    };

    await sendPaymentReceiptEmail(receiptInput);
  }

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

export async function getPaymentView(
  registrationId: string,
  actor: SessionUser,
): Promise<PaymentViewResponse> {
  const [latest, registrationFee, accounts] = await Promise.all([
    withDbLogging("payment.findLatestFee", () =>
      repository.findLatestFee(registrationId),
    ),
    getRegistrationFee(),
    authService.listAccounts(),
  ]);
  const isPaid = latest?.status === "success";
  const recorder = accounts.find(
    (account) => account.id === latest?.recorded_by,
  );
  const methodLabels: Record<string, string> = {
    CASH: "Tunai",
    TRANSFER: "Transfer",
  };
  const methodLabel =
    latest?.source === "manual"
      ? (methodLabels[latest.payment_method ?? ""] ?? null)
      : "DOKU";

  const view: PaymentViewResponse = {
    state: isPaid ? "paid" : latest ? "waiting" : "unpaid",
    amount_label: formatRupiah(isPaid ? latest.amount : registrationFee),
    method_label: isPaid ? methodLabel : null,
    receipt_number: isPaid ? latest.receipt_number : null,
    recorded_by_name: isPaid && recorder ? toStaffName(recorder) : null,
    paid_at_label:
      isPaid && latest.paid_at ? formatDateTime(latest.paid_at) : null,
    can_manage: authService.hasPermission(actor.role, "manage_payments"),
    can_cancel:
      isPaid &&
      latest.source === "manual" &&
      authService.hasPermission(actor.role, "cancel_payments"),
  };
  return view;
}

export async function markPaid(
  input: MarkPaidInput,
): Promise<PaymentActionFailureReason | null> {
  const { registrationId, request, actor } = input;
  const [registration, latest, registrationFee] = await Promise.all([
    registrationService.findFullById(registrationId),
    withDbLogging("payment.findLatestFee", () =>
      repository.findLatestFee(registrationId),
    ),
    getRegistrationFee(),
  ]);
  const blockReason = findPaymentBlock(actor, registration, latest);
  if (blockReason || !registration) return blockReason ?? "not_found";

  const payment: NewManualPayment = {
    registrationId,
    invoiceNumber: generateInvoiceNumber("MANUAL"),
    amount: registrationFee,
    snapshot: toSnapshot(registration),
    recordedBy: actor.id,
    paymentMethod: request.method,
    receiptNumber: request.receipt_number,
  };
  await withTransaction(async (tx) => {
    await repository.expirePendingWithin(tx, registrationId);
    await repository.insertManualWithin(tx, payment);
  });
  return null;
}

export async function cancelPayment(
  registrationId: string,
  actor: SessionUser,
): Promise<PaymentActionFailureReason | null> {
  if (!authService.hasPermission(actor.role, "cancel_payments")) {
    return "forbidden_payment";
  }

  const cancelled = await withDbLogging("payment.cancelManual", () =>
    repository.cancelManual(registrationId, actor.id),
  );
  return cancelled ? null : "not_found";
}

export async function createPaymentLink(
  registrationId: string,
  actor: SessionUser,
): Promise<PaymentLinkResult> {
  const [registration, latest, registrationFee] = await Promise.all([
    registrationService.findFullById(registrationId),
    withDbLogging("payment.findLatestFee", () =>
      repository.findLatestFee(registrationId),
    ),
    getRegistrationFee(),
  ]);
  const blockReason = registration?.contact_phone
    ? findPaymentBlock(actor, registration, latest)
    : "not_found";
  if (blockReason || !registration?.contact_phone) {
    const blocked: PaymentLinkResult = {
      ok: false,
      reason: blockReason ?? "not_found",
    };
    return blocked;
  }

  const payment: NewFeePayment = {
    registrationId,
    invoiceNumber: generateInvoiceNumber("PPDB"),
    amount: registrationFee,
    snapshot: toSnapshot(registration),
    recordedBy: actor.id,
  };
  const paymentId = await withDbLogging("payment.insertPendingFee", () =>
    repository.insertPendingFee(payment),
  );
  const checkout = await createCheckoutSession({
    invoiceNumber: payment.invoiceNumber,
    amount: payment.amount,
    payload: payment.snapshot,
    dueMinutes: 24 * 60,
  });
  if (!checkout.ok) {
    const gatewayError: PaymentLinkResult = {
      ok: false,
      reason: "gateway_error",
    };
    return gatewayError;
  }

  await withDbLogging("payment.attachSession", () =>
    repository.attachSession(paymentId, checkout.session),
  );
  const message = [
    "Assalamu'alaikum, berikut link pembayaran biaya pendaftaran SDI Darussalam Cikunir.",
    `Nama anak: ${registration.full_name}\nNo. pendaftaran: ${registration.registration_number ?? "-"}\nBiaya: ${formatRupiah(payment.amount)}`,
    checkout.session.paymentUrl,
  ].join("\n\n");

  const result: PaymentLinkResult = {
    ok: true,
    whatsapp_url: buildWhatsAppLink(registration.contact_phone, message),
  };
  return result;
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

export async function listPayments(
  params: ListPaymentsRequest,
): Promise<PaymentListResponse> {
  const filter: PaymentFilter = {
    search: params.search,
    statuses: params.statuses,
    paidFrom: params.paid_from,
    paidTo: params.paid_to,
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

export async function getRevenueSummary(
  params: RevenueSummaryRequest,
): Promise<PaymentRevenueSummaryResponse> {
  const filter = {
    paidFrom: params.paid_from,
    paidTo: params.paid_to,
  };

  return withDbLogging("payment.sumRevenue", () =>
    repository.sumRevenue(filter),
  );
}

export async function getSummariesByRegistrationIds(
  registrationIds: string[],
): Promise<RegistrationPaymentSummaries> {
  if (registrationIds.length === 0) return new Map();

  const rows = await withDbLogging(
    "payment.listSummariesByRegistrationIds",
    () => repository.listSummariesByRegistrationIds(registrationIds),
  );
  const summaries: RegistrationPaymentSummaries = new Map(
    rows.map(({ registration_id, ...summary }) => [registration_id, summary]),
  );
  return summaries;
}

function findPaymentBlock(
  actor: SessionUser,
  registration: { status: string } | null,
  latest: FeePaymentRow | null,
): PaymentActionFailureReason | null {
  if (!authService.hasPermission(actor.role, "manage_payments")) {
    return "forbidden_payment";
  }
  if (!registration) return "not_found";
  if (registration.status === "cancelled") return "invalid_state";
  if (latest?.status === "success") return "already_paid";
  return null;
}

function toSnapshot(registration: {
  full_name: string;
  student_nik: string | null;
  parent_email: string | null;
  contact_phone: string | null;
}): PaymentSnapshot {
  const snapshot: PaymentSnapshot = {
    student: {
      full_name: registration.full_name,
      nik: registration.student_nik,
    },
    parent_email: registration.parent_email,
    parents: registration.contact_phone
      ? [{ parent_type: "father", phone: registration.contact_phone }]
      : [],
  };
  return snapshot;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
