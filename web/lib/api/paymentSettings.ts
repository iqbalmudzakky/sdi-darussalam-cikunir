import type { PaymentSettingsResponse } from "@/types/PaymentSettings";

export async function getPaymentSettings(): Promise<PaymentSettingsResponse> {
  const res = await fetch("/api/payment-settings");
  if (!res.ok) throw new Error(`Failed to load payment settings (${res.status})`);
  return res.json();
}

export async function savePaymentSettings(
  registrationFee: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/payment-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ registration_fee: registrationFee }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal menyimpan pengaturan." };
  }

  return { ok: true };
}
