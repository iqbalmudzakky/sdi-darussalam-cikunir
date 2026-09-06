import type { PaymentSettingsResponse } from "@/types/PaymentSettings";

export async function getPaymentSettings(): Promise<PaymentSettingsResponse> {
  const res = await fetch("/api/payment-settings");
  if (!res.ok)
    throw new Error(`Failed to load payment settings (${res.status})`);
  return res.json();
}

export async function savePaymentSettings(input: {
  registrationFee: number;
  registrationOpensOn: string | null;
  registrationClosesOn: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const body = {
    registration_fee: input.registrationFee,
    registration_opens_on: input.registrationOpensOn,
    registration_closes_on: input.registrationClosesOn,
  };

  const res = await fetch("/api/payment-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal menyimpan pengaturan." };
  }

  return { ok: true };
}
