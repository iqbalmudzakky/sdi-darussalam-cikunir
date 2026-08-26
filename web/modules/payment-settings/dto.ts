import { z } from "zod";

/**
 * Upper bound is a sanity check, not a business rule: it catches a slipped
 * digit (15500000 instead of 155000) before an applicant is shown a bill for
 * fifteen million rupiah.
 */
const MAX_REGISTRATION_FEE = 10_000_000;

export const SavePaymentSettingsRequestSchema = z.object({
  registration_fee: z
    .number({ message: "Biaya pendaftaran harus berupa angka." })
    .int("Biaya pendaftaran harus berupa angka bulat (tanpa desimal).")
    .min(1, "Biaya pendaftaran harus lebih dari 0.")
    .max(
      MAX_REGISTRATION_FEE,
      "Biaya pendaftaran maksimal Rp10.000.000. Periksa kembali angkanya.",
    ),
});

export type SavePaymentSettingsRequest = z.infer<
  typeof SavePaymentSettingsRequestSchema
>;

export type PaymentSettingsResponse = {
  registration_fee: number;
  updated_at: string;
};
