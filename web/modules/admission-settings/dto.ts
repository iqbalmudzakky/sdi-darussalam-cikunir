import { z } from "zod";
import { MAX_ADMISSION_FEE } from "@/modules/shared/constant/admissionSettings";
import { phoneNumber } from "@/modules/validation/validators";
import type { AdmissionSettingsRow } from "./entity";

const AmountSchema = z
  .number({ message: "Nominal harus berupa angka." })
  .int("Nominal harus angka bulat.")
  .min(0, "Nominal tidak boleh minus.")
  .max(MAX_ADMISSION_FEE, "Nominal terlalu besar. Periksa kembali angkanya.");

const TextSchema = z
  .string()
  .trim()
  .min(1, "Semua isian wajib diisi.")
  .max(120, "Isian maksimal 120 karakter.");

export const SaveAdmissionSettingsRequestSchema = z.object({
  tahfizh_yearly_fee: AmountSchema,
  tahfizh_july_fee: AmountSchema,
  unggulan_yearly_fee: AmountSchema,
  unggulan_july_fee: AmountSchema,
  darussalam_discount: AmountSchema,
  other_discount: AmountSchema,
  payment_deadline: z.iso.date("Batas pembayaran wajib diisi."),
  bank_name: TextSchema,
  bank_account_number: TextSchema,
  bank_account_name: TextSchema,
  principal_name: TextSchema,
  committee_chair_name: TextSchema,
  director_name: TextSchema,
  pmb_contact_phone: phoneNumber("CP PMB"),
  letter_contacts: z
    .array(
      z.object({
        name: TextSchema,
        phone: phoneNumber("No. WhatsApp CP"),
      }),
    )
    .min(1, "Isi minimal satu CP di Surat Diterima.")
    .max(5, "CP di Surat Diterima maksimal 5."),
});

export type SaveAdmissionSettingsRequest = z.infer<
  typeof SaveAdmissionSettingsRequestSchema
>;

export type AdmissionSettingsResponse = Omit<
  AdmissionSettingsRow,
  "updated_at"
>;
