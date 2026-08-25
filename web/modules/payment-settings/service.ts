import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import type { PaymentSettings } from "./entity";

/**
 * Reads the fee charged to applicants.
 *
 * Throws when the settings row is missing rather than falling back to a
 * constant: a wrong amount is charged to real people and reconciled against
 * real bank settlements, so failing loudly is far better than quietly billing
 * something nobody chose.
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
