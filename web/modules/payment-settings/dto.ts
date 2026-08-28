import { z } from "zod";

/* Batas atas untuk menangkap salah ketik digit, bukan aturan bisnis. */
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
