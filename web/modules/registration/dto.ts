import { z } from "zod";
import type { Registration, RegistrationStatus } from "./entity";

/*
 * Nama orang: huruf, spasi, apostrof, titik, dan tanda hubung.
 * Angka dan simbol lain ditolak.
 */
const PERSON_NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;

/*
 * Nomor WhatsApp Indonesia.
 *
 * Yang disimpan hanya digit. Pemisah seperti spasi,
 * tanda hubung, dan tanda kurung dibuang lebih dulu,
 * dan awalan +62 / 62 dinormalkan menjadi 0.
 */
export function normalizeWhatsappNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.startsWith("62")) {
    return `0${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.startsWith("8")) {
    return `0${digitsOnly}`;
  }

  return digitsOnly;
}

export const CreateRegistrationRequestSchema = z.object({
  parent_name: z
    .string()
    .trim()
    .min(3, "Nama orang tua minimal 3 karakter.")
    .max(80, "Nama orang tua maksimal 80 karakter.")
    .regex(PERSON_NAME_PATTERN, "Nama orang tua hanya boleh berisi huruf."),
  student_name: z
    .string()
    .trim()
    .min(3, "Nama calon siswa minimal 3 karakter.")
    .max(80, "Nama calon siswa maksimal 80 karakter.")
    .regex(PERSON_NAME_PATTERN, "Nama calon siswa hanya boleh berisi huruf."),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi.")
    .transform(normalizeWhatsappNumber)
    .refine(
      (value) => /^0\d{9,13}$/.test(value),
      "Nomor WhatsApp tidak valid. Contoh: 081234567890.",
    ),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .max(120, "Email maksimal 120 karakter.")
    .email("Format email tidak valid."),
  message: z
    .string()
    .trim()
    .max(1000, "Pesan maksimal 1000 karakter.")
    .default(""),
});

export type CreateRegistrationRequest = z.infer<
  typeof CreateRegistrationRequestSchema
> & {
  ip_address: string;
};

export type CreateRegistrationResult =
  | { ok: true; registration: Registration }
  | { ok: false; reason: "rate_limited" | "duplicate"; message: string };

const REGISTRATION_STATUSES: [RegistrationStatus, ...RegistrationStatus[]] = [
  "pending",
  "in_progress",
  "completed",
];

export const UpdateRegistrationStatusRequestSchema = z.object({
  status: z.enum(REGISTRATION_STATUSES),
});

export type UpdateRegistrationStatusRequest = z.infer<
  typeof UpdateRegistrationStatusRequestSchema
>;
