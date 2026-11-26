import { withDbLogging } from "@/modules/db/errors";
import { jakartaDateKey } from "@/modules/shared/date/jakartaDate";
import {
  DOKU_MDR_METHODS,
  DOKU_PPN_RATE,
} from "@/modules/shared/constant/integration/doku";
import * as authService from "@/modules/auth/service";
import type { AdminRole } from "@/modules/shared/constant/account/role";
import * as repository from "./repository";
import type { PaymentSettings, PaymentSettingsUpdateInput } from "./entity";
import type { DokuEstimate, PaymentSettingsResponse } from "./dto";

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

export async function getPaymentSettingsResponse(
  estimateFee: number | null,
  actingRole: AdminRole,
): Promise<PaymentSettingsResponse | null> {
  const settings = await withDbLogging("paymentSettings.get", () =>
    repository.get(),
  );
  if (!settings) return null;

  const fee = estimateFee ?? settings.registration_fee;
  const dokuEstimates: DokuEstimate[] = DOKU_MDR_METHODS.map((method) => {
    const base = method.kind === "flat" ? method.value : fee * method.value;
    const deduction = Math.round(base * (1 + DOKU_PPN_RATE));
    const estimate: DokuEstimate = {
      method: method.label,
      deduction,
      received: fee - deduction,
    };
    return estimate;
  });

  const response: PaymentSettingsResponse = {
    registration_fee: settings.registration_fee,
    registration_opens_on: settings.registration_opens_on,
    registration_closes_on: settings.registration_closes_on,
    updated_at: settings.updated_at,
    doku_estimates: dokuEstimates,
    can_manage: authService.hasPermission(
      actingRole,
      "manage_admission_settings",
    ),
  };
  return response;
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
