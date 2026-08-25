import { z } from "zod";
import { personName, phoneNumber, birthPlace, birthDate } from "@/modules/validation/validators";
import type { PpdbRegistrationStatus } from "./entity";

const REGISTRATION_TYPE_VALUES = ["siswa_baru", "pindahan"] as const;

const GENDER_VALUES = ["laki_laki", "perempuan"] as const;

const PHYSICAL_DISABILITY_VALUES = ["tidak_ada", "ada"] as const;

const PARENT_TYPE_VALUES = ["father", "mother"] as const;

const PARENT_RELATIONSHIP_STATUS_VALUES = ["kandung", "tiri", "angkat", "wali"] as const;

function nik(label: string) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .regex(/^\d{16}$/, `${label} harus terdiri dari tepat 16 digit angka.`);
}

export const CreatePpdbRegistrationStudentSchema = z.object({
  full_name: personName("Nama lengkap siswa"),

  nickname: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),

  nik: nik("NIK anak"),

  nisn: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),

  gender: z.enum(GENDER_VALUES),

  place_of_birth: birthPlace("Tempat lahir"),

  date_of_birth: birthDate("Tanggal lahir"),

  address: z.string().trim().min(1, "Alamat wajib diisi.").max(200, "Alamat maksimal 200 karakter."),

  village: z.string().trim().nullable().optional(),

  rt_rw: z.string().trim().nullable().optional(),

  district: z.string().trim().nullable().optional(),

  city: z.string().trim().nullable().optional(),

  province: z.string().trim().nullable().optional(),

  phone: phoneNumber("Nomor telepon siswa").nullable().optional(),

  birth_order: z.number().int("Anak ke- harus berupa angka bulat.").min(1, "Anak ke- minimal 1."),

  sibling_count: z.number().int("Jumlah saudara harus berupa angka bulat.").min(0, "Jumlah saudara minimal 0."),

  orphan_status: z.string().trim().nullable().optional(),

  daily_language: z.string().trim().nullable().optional(),

  citizenship: z.string().trim().default("Indonesia"),

  religion: z.string().trim().min(1, "Agama wajib diisi."),

  physical_disability: z.enum(PHYSICAL_DISABILITY_VALUES),

  previous_school: z.string().trim().min(1, "Asal sekolah wajib diisi.").max(120, "Asal sekolah maksimal 120 karakter."),

  previous_school_transfer: z.string().trim().nullable().optional(),
});

export const CreatePpdbRegistrationParentSchema = z.object({
  parent_type: z.enum(PARENT_TYPE_VALUES),

  relationship_status: z.enum(PARENT_RELATIONSHIP_STATUS_VALUES),

  name: personName("Nama orang tua"),

  nik: nik("NIK orang tua"),

  place_of_birth: birthPlace("Tempat lahir orang tua"),

  date_of_birth: birthDate("Tanggal lahir orang tua"),

  religion: z.string().trim().nullable().optional(),

  education: z.string().trim().nullable().optional(),

  occupation: z.string().trim().nullable().optional(),

  position: z.string().trim().nullable().optional(),

  income: z.number().int().nullable().optional(),

  citizenship: z.string().trim().default("Indonesia"),

  phone: phoneNumber("Nomor HP orang tua"),
});

export const CreatePpdbRegistrationDetailSchema = z.object({
  living_with: z.string().trim().nullable().optional(),

  distance_to_school: z.string().trim().nullable().optional(),

  owned_vehicle: z.string().trim().nullable().optional(),

  transportation_method: z.string().trim().nullable().optional(),

  talent: z.string().trim().nullable().optional(),

  blood_type: z.string().trim().nullable().optional(),

  height: z.number().int().min(0).nullable().optional(),

  weight: z.number().int().min(0).nullable().optional(),

  head_circumference: z.number().int().min(0).nullable().optional(),
});

export const CreatePpdbRegistrationRequestSchema = z.object({
  registration_type: z.enum(REGISTRATION_TYPE_VALUES),

  parent_email: z
    .string()
    .trim()
    .nullable()
    .optional()
    .transform((value) => value || null),

  student: CreatePpdbRegistrationStudentSchema,

  parents: z.array(CreatePpdbRegistrationParentSchema),

  details: CreatePpdbRegistrationDetailSchema,
});

export type CreatePpdbRegistrationRequest = z.infer<typeof CreatePpdbRegistrationRequestSchema> & {
  ip_address: string;
};

export type CreatePpdbRegistrationResult =
  | {
      ok: true;
      registration_id: string;
    }
  | {
      ok: false;
      reason: "rate_limited" | "duplicate";
      message: string;
    };

const REGISTRATION_STATUSES: [PpdbRegistrationStatus, ...PpdbRegistrationStatus[]] = ["pending", "in_progress", "not_registered", "registered"];

export const UpdatePpdbRegistrationStatusRequestSchema = z.object({
  status: z.enum(REGISTRATION_STATUSES),
});

export type UpdatePpdbRegistrationStatusRequest = z.infer<typeof UpdatePpdbRegistrationStatusRequestSchema>;
