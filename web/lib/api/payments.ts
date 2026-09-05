import type { SubmitRegistrationInput } from "@/types/Registration";
import type {
  ListPaymentsParams,
  PaymentListPage,
  PaymentStatusView,
} from "@/types/Payment";

export async function startRegistrationPayment(
  input: SubmitRegistrationInput,
): Promise<{ ok: true; paymentUrl: string } | { ok: false; error: string }> {
  const res = await fetch("/api/payments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: data.error ?? "Gagal memulai pembayaran." };
  }

  if (!data.payment_url) {
    return { ok: false, error: "Gagal memulai pembayaran." };
  }

  return { ok: true, paymentUrl: data.payment_url };
}

export async function listPayments(
  params: ListPaymentsParams,
): Promise<PaymentListPage> {
  const query = new URLSearchParams();
  for (const status of params.statuses) query.append("status", status);
  query.set("search", params.search);
  query.set("sort", params.sort);
  query.set("limit", String(params.limit));
  query.set("offset", String(params.offset));

  const res = await fetch(`/api/payments?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to list payments (${res.status})`);
  return res.json();
}

export async function getPaymentStatus(
  invoiceNumber: string,
): Promise<PaymentStatusView | null> {
  const res = await fetch(
    `/api/payments/status?invoice=${encodeURIComponent(invoiceNumber)}`,
  );
  if (!res.ok) return null;
  return res.json();
}
