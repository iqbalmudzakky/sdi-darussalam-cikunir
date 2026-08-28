import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import type { PaymentSettings } from "./entity";

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

export async function saveRegistrationFee(
  fee: number,
): Promise<PaymentSettings | null> {
  return withDbLogging("paymentSettings.updateFee", () =>
    repository.updateFee(fee),
  );
}
