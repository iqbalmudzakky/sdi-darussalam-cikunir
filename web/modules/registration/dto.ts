import { z } from "zod";
import { personName, phoneNumber, birthPlace, birthDate } from "@/modules/validation/validators";
import type { Registration, RegistrationStatus } from "./entity";

const REGISTRATION_TYPE_VALUES = ["siswa_baru", "pindahan"] as const;
const GENDER_VALUES = ["laki_laki", "perempuan"] as const;
const PHYSICAL_DISABILITY_VALUES = ["tidak_ada", "ada"] as const;
const PARENT_RELATIONSHIP_VALUES = ["kandung", "tiri", "angkat", "wali"] as const;

export const CreateRegistrationRequestSchema = z.object({
  registration_type: z.enum(REGISTRATION_TYPE_VALUES),
  full_name: personName("Nama lengkap siswa"),
  gender: z.enum(GENDER_VALUES),
  place_of_birth: birthPlace("Tempat lahir"),
  date_of_birth: birthDate("Tanggal lahir"),
  current_address: z
    .string()
    .trim()
    .min(1, "Alamat sekarang wajib diisi.")
    .max(200, "Alamat sekarang maksimal 200 karakter."),
  physical_disability: z.enum(PHYSICAL_DISABILITY_VALUES),
  previous_school: z
    .string()
    .trim()
    .min(1, "Asal sekolah wajib diisi.")
    .max(120, "Asal sekolah maksimal 120 karakter."),
  nisn: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),
  father_status: z.enum(PARENT_RELATIONSHIP_VALUES),
  father_name: personName("Nama ayah"),
  father_place_of_birth: birthPlace("Tempat lahir ayah"),
  father_date_of_birth: birthDate("Tanggal lahir ayah"),
  father_phone: phoneNumber("Nomor HP ayah"),
  mother_status: z.enum(PARENT_RELATIONSHIP_VALUES),
  mother_name: personName("Nama ibu"),
  mother_place_of_birth: birthPlace("Tempat lahir ibu"),
  mother_date_of_birth: birthDate("Tanggal lahir ibu"),
  mother_phone: phoneNumber("Nomor HP ibu"),
  parent_email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .max(120, "Email maksimal 120 karakter.")
    .email("Format email tidak valid."),
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
