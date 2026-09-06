import { withDbLogging } from "@/modules/db/errors";
import { jakartaDateKey } from "@/modules/shared/jakartaDate";
import * as repository from "./repository";
import type { PaymentSettings, PaymentSettingsUpdateInput } from "./entity";

/*
 * Melempar error kalau barisnya hilang, bukan memakai nilai cadangan: nominal
 * ini ditagihkan ke orang sungguhan, jadi lebih baik gagal terang-terangan.
 */
export async function getRegistrationFee(): Promise<number> {
  const settings = await withDbLogging("paymentSettings.get", () =>
    repository.get(),
  );

  if (!settings) {
    throw new Error(
      "payment_settings row is missing — run the payment_settings migration.",
    );
  }

  return settings.registration_fee;
}

export async function getPaymentSettings(): Promise<PaymentSettings | null> {
  return withDbLogging("paymentSettings.get", () => repository.get());
}

export async function saveSettings(
  input: PaymentSettingsUpdateInput,
): Promise<PaymentSettings | null> {
  return withDbLogging("paymentSettings.update", () =>
    repository.update(input),
  );
}

/* Ditutup kalau salah satu tanggal belum diatur admin. */
export async function isRegistrationOpen(): Promise<boolean> {
  const settings = await withDbLogging("paymentSettings.get", () =>
    repository.get(),
  );

  if (!settings?.registration_opens_on || !settings.registration_closes_on) {
    return false;
  }

  const today = jakartaDateKey(new Date());
  const opensOn = jakartaDateKey(new Date(settings.registration_opens_on));
  const closesOn = jakartaDateKey(new Date(settings.registration_closes_on));

  return today >= opensOn && today <= closesOn;
}
