import { randomUUID } from "node:crypto";
import {
  CHECKOUT_REQUEST_TARGET,
  NOTIFICATION_REQUEST_TARGET,
  getDokuConfig,
  getSiteUrl,
} from "./config";
import {
  currentRequestTimestamp,
  generateDigest,
  generateSignature,
} from "./signature";
import type { RegistrationPayload } from "./entity";

export type CheckoutSession = {
  paymentUrl: string;
  tokenId: string;
  sessionId: string;
  expiredDate: string;
};

export type CreateCheckoutResult =
  | { ok: true; session: CheckoutSession }
  | { ok: false; message: string };

/* Halaman bayar berlaku satu jam, mengikuti default DOKU. */
const PAYMENT_DUE_DATE_MINUTES = 60;

/* DOKU minta format 62…, sedangkan kita menyimpan 08…. */
function toInternationalPhone(localNumber: string): string {
  return localNumber.replace(/^0/, "62");
}

/* customer.name hanya boleh huruf; tanda baca dibuang agar tidak ditolak. */
function toCustomerName(fullName: string): string {
  return fullName.replace(/[^\p{L}\s]/gu, "").trim();
}

/* Nama pakai nama anak, bukan ayah/ibu — pembayarnya bisa siapa saja. */
function buildCustomer(payload: RegistrationPayload) {
  const parents = payload.parents ?? [];
  const contact =
    parents.find((parent) => parent.parent_type === "father") ?? parents[0];

  return {
    name: toCustomerName(payload.student.full_name),
    email: payload.parent_email ?? undefined,
    phone: contact ? toInternationalPhone(contact.phone) : undefined,
    country: "ID",
  };
}

export async function createCheckoutSession(input: {
  invoiceNumber: string;
  amount: number;
  payload: RegistrationPayload;
  /** The originating request, so dev can derive the tunnel host from it. */
  request?: Request;
}): Promise<CreateCheckoutResult> {
  const { clientId, secretKey, baseUrl } = getDokuConfig();
  const siteUrl = getSiteUrl(input.request);

  const requestBody = {
    order: {
      amount: input.amount,
      invoice_number: input.invoiceNumber,
      currency: "IDR",
      language: "ID",
      auto_redirect: true,
      callback_url: `${siteUrl}/pendaftaran/status?invoice=${input.invoiceNumber}`,
      callback_url_result: `${siteUrl}/pendaftaran/status?invoice=${input.invoiceNumber}`,
      line_items: [
        {
          id: "PPDB",
          name: "Biaya Pendaftaran Siswa Baru",
          quantity: 1,
          price: input.amount,
        },
      ],
    },
    payment: {
      payment_due_date: PAYMENT_DUE_DATE_MINUTES,
      type: "SALE",
    },
    customer: buildCustomer(input.payload),
    additional_info: {
      override_notification_url: `${siteUrl}${NOTIFICATION_REQUEST_TARGET}`,
    },
  };

  /* Digest harus atas byte yang persis dikirim, jadi diserialisasi sekali. */
  const rawBody = JSON.stringify(requestBody);
  const requestId = randomUUID();
  const requestTimestamp = currentRequestTimestamp();
  const digest = generateDigest(rawBody);

  const signature = generateSignature(
    {
      clientId,
      requestId,
      requestTimestamp,
      requestTarget: CHECKOUT_REQUEST_TARGET,
      digest,
    },
    secretKey,
  );

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${CHECKOUT_REQUEST_TARGET}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": clientId,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        Signature: signature,
      },
      body: rawBody,
    });
  } catch (error) {
    console.error("[doku] createCheckoutSession request failed:", error);
    return {
      ok: false,
      message: "Tidak dapat menghubungi layanan pembayaran.",
    };
  }

  const text = await response.text();

  if (!response.ok) {
    /* DOKU mengembalikan error validasinya di array `message`. */
    console.error(
      `[doku] createCheckoutSession returned ${response.status}:`,
      text,
    );
    return { ok: false, message: "Gagal membuat sesi pembayaran." };
  }

  let parsed: {
    response?: {
      order?: { session_id?: string };
      payment?: { url?: string; token_id?: string; expired_date?: string };
    };
  };
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.error("[doku] createCheckoutSession returned invalid JSON:", error);
    return { ok: false, message: "Gagal membuat sesi pembayaran." };
  }

  const payment = parsed.response?.payment;
  if (!payment?.url || !payment.token_id) {
    console.error(
      "[doku] createCheckoutSession response missing payment url:",
      text,
    );
    return { ok: false, message: "Gagal membuat sesi pembayaran." };
  }

  return {
    ok: true,
    session: {
      paymentUrl: payment.url,
      tokenId: payment.token_id,
      sessionId: parsed.response?.order?.session_id ?? "",
      expiredDate: payment.expired_date ?? "",
    },
  };
}
