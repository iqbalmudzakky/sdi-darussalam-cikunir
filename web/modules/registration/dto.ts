import { z } from "zod";
import {
  personName,
  phoneNumber,
  birthPlace,
  birthDate,
} from "@/modules/validation/validators";
import type { PpdbRegistrationStatus } from "./entity";

const REGISTRATION_TYPE_VALUES = ["siswa_baru", "pindahan"] as const;

const GENDER_VALUES = ["laki_laki", "perempuan"] as const;

const PHYSICAL_DISABILITY_VALUES = ["tidak_ada", "ada"] as const;

const PARENT_TYPE_VALUES = ["father", "mother"] as const;

const PARENT_RELATIONSHIP_STATUS_VALUES = [
  "kandung",
  "tiri",
  "angkat",
  "wali",
] as const;

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

  address: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi.")
    .max(200, "Alamat maksimal 200 karakter."),

  // Wajib: alamat yang setengah kosong tidak terpakai untuk pelaporan
  // Dapodik, dan melengkapinya belakangan berarti menghubungi orang tua
  // satu per satu.
  village: z.string().trim().min(1, "Kelurahan wajib dipilih."),

  rt_rw: z.string().trim().min(1, "RT/RW wajib diisi."),

  district: z.string().trim().min(1, "Kecamatan wajib dipilih."),

  city: z.string().trim().min(1, "Kabupaten/Kota wajib dipilih."),

  province: z.string().trim().min(1, "Provinsi wajib dipilih."),

  phone: phoneNumber("Nomor telepon siswa").nullable().optional(),

  birth_order: z
    .number()
    .int("Anak ke- harus berupa angka bulat.")
    .min(1, "Anak ke- minimal 1."),

  sibling_count: z
    .number()
    .int("Jumlah saudara harus berupa angka bulat.")
    .min(0, "Jumlah saudara minimal 0."),

  orphan_status: z.string().trim().nullable().optional(),

  daily_language: z.string().trim().nullable().optional(),

  citizenship: z.string().trim().default("Indonesia"),

  religion: z.string().trim().min(1, "Agama wajib diisi."),

  physical_disability: z.enum(PHYSICAL_DISABILITY_VALUES),

  previous_school: z
    .string()
    .trim()
    .min(1, "Asal sekolah wajib diisi.")
    .max(120, "Asal sekolah maksimal 120 karakter."),

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

export type CreatePpdbRegistrationRequest = z.infer<
  typeof CreatePpdbRegistrationRequestSchema
> & {
  ip_address: string;
};

export type CreatePpdbRegistrationResult =
  | {
      ok: true;
      registration_id: string;
    }
  | {
      ok: false;
      reason: "duplicate";
      message: string;
    };

const REGISTRATION_STATUSES: [
  PpdbRegistrationStatus,
  ...PpdbRegistrationStatus[],
] = ["pending", "in_progress", "not_registered", "registered"];

export const UpdatePpdbRegistrationStatusRequestSchema = z.object({
  status: z.enum(REGISTRATION_STATUSES),
});

const SORT_DIRECTION_VALUES = ["asc", "desc"] as const;

export const ListRegistrationsQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
  statuses: z.array(z.enum(REGISTRATION_STATUSES)).default([]),
  sort: z.enum(SORT_DIRECTION_VALUES).default("desc"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListRegistrationsQuery = z.infer<
  typeof ListRegistrationsQuerySchema
>;

export const ExportRegistrationsQuerySchema = z.object({
  statuses: z.array(z.enum(REGISTRATION_STATUSES)).default([]),
});

export type ExportRegistrationsQuery = z.infer<
  typeof ExportRegistrationsQuerySchema
>;

export type UpdatePpdbRegistrationStatusRequest = z.infer<
  typeof UpdatePpdbRegistrationStatusRequestSchema
>;

export type RegistrationListItemResponse = {
  id: string;
  registration_type: "siswa_baru" | "pindahan";
  status: PpdbRegistrationStatus;
  ip_address: string | null;
  parent_email: string | null;
  created_at: string;

  full_name: string;
  student_nik: string;
  gender: "laki_laki" | "perempuan";
  place_of_birth: string;
  date_of_birth: string;
  birth_order: number;
  sibling_count: number;
  current_address: string;
  physical_disability: "tidak_ada" | "ada";
  previous_school: string;
  nisn: string | null;

  father_status: "kandung" | "tiri" | "angkat" | "wali" | null;
  father_name: string | null;
  father_nik: string | null;
  father_place_of_birth: string | null;
  father_date_of_birth: string | null;
  father_phone: string | null;
  father_income: number | null;

  mother_status: "kandung" | "tiri" | "angkat" | "wali" | null;
  mother_name: string | null;
  mother_nik: string | null;
  mother_place_of_birth: string | null;
  mother_date_of_birth: string | null;
  mother_phone: string | null;
  mother_income: number | null;

  payment_status: "pending" | "success" | "failed" | "expired" | null;
  payment_amount: number | null;
  paid_at: string | null;
  invoice_number: string | null;
};

export type RegistrationListResponse = {
  items: RegistrationListItemResponse[];
  total: number;
  has_more: boolean;
};

export type RegistrantRegion = {
  city: string;
  province: string;
  total: number;
};
