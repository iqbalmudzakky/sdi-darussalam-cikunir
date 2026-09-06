import { z } from "zod";

/* Batas atas untuk menangkap salah ketik digit, bukan aturan bisnis. */
const MAX_REGISTRATION_FEE = 10_000_000;

const NullableDateSchema = z
  .string()
  .date("Format tanggal tidak valid.")
  .nullable();

export const SavePaymentSettingsRequestSchema = z
  .object({
    registration_fee: z
      .number({ message: "Biaya pendaftaran harus berupa angka." })
      .int("Biaya pendaftaran harus berupa angka bulat (tanpa desimal).")
      .min(1, "Biaya pendaftaran harus lebih dari 0.")
      .max(
        MAX_REGISTRATION_FEE,
        "Biaya pendaftaran maksimal Rp10.000.000. Periksa kembali angkanya.",
      ),
    registration_opens_on: NullableDateSchema,
    registration_closes_on: NullableDateSchema,
  })
  .refine(
    (data) =>
      !data.registration_opens_on ||
      !data.registration_closes_on ||
      data.registration_closes_on >= data.registration_opens_on,
    {
      message: "Tanggal tutup harus sama atau setelah tanggal buka.",
      path: ["registration_closes_on"],
    },
  );

export type SavePaymentSettingsRequest = z.infer<
  typeof SavePaymentSettingsRequestSchema
>;

export type PaymentSettingsResponse = {
  registration_fee: number;
  registration_opens_on: string | null;
  registration_closes_on: string | null;
  updated_at: string;
};
