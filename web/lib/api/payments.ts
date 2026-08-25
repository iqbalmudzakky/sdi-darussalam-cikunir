import type { SubmitRegistrationInput } from "@/types/Registration";
import type { PaymentStatusView } from "@/types/Payment";

export async function startRegistrationPayment(
  input: SubmitRegistrationInput,
): Promise<
  { ok: true; paymentUrl: string } | { ok: false; error: string }
> {
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

export async function getPaymentStatus(
  invoiceNumber: string,
): Promise<PaymentStatusView | null> {
  const res = await fetch(
    `/api/payments/status?invoice=${encodeURIComponent(invoiceNumber)}`,
  );
  if (!res.ok) return null;
  return res.json();
}
