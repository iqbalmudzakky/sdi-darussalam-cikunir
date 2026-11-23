import { z } from "zod";
import {
  personName,
  phoneNumber,
  birthPlace,
  birthDate,
  blankable,
  requiredEmail,
} from "@/modules/validation/validators";
import {
  MAX_HEAD_CIRCUMFERENCE_CM,
  MAX_HEIGHT_CM,
  MAX_PARENT_INCOME,
  MAX_SIBLING_NUMBER,
  MAX_WEIGHT_KG,
  REGISTRATION_TYPES,
} from "@/modules/shared/constant/registration";
import {
  RELIGION_LABEL,
  SPECIAL_NEEDS_LABEL,
} from "@/modules/shared/constant/registrationForm";

const REGISTRATION_TYPE_VALUES = REGISTRATION_TYPES;

export const GENDER_VALUES = ["laki_laki", "perempuan"] as const;

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
    .min(1, "Anak ke- minimal 1.")
    .max(MAX_SIBLING_NUMBER, `Anak ke- maksimal ${MAX_SIBLING_NUMBER}.`),

  sibling_count: z
    .number()
    .int("Jumlah saudara harus berupa angka bulat.")
    .min(0, "Jumlah saudara minimal 0.")
    .max(MAX_SIBLING_NUMBER, `Jumlah saudara maksimal ${MAX_SIBLING_NUMBER}.`),

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

  income: z
    .number()
    .int("Penghasilan harus berupa angka bulat.")
    .min(0, "Penghasilan tidak boleh negatif.")
    .max(
      MAX_PARENT_INCOME,
      "Penghasilan maksimal Rp1.000.000.000 per bulan. Periksa kembali angkanya.",
    )
    .nullable()
    .optional(),

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

  height: z
    .number()
    .int("Tinggi badan harus berupa angka bulat.")
    .min(0, "Tinggi badan tidak boleh negatif.")
    .max(MAX_HEIGHT_CM, `Tinggi badan maksimal ${MAX_HEIGHT_CM} cm.`)
    .nullable()
    .optional(),

  weight: z
    .number()
    .int("Berat badan harus berupa angka bulat.")
    .min(0, "Berat badan tidak boleh negatif.")
    .max(MAX_WEIGHT_KG, `Berat badan maksimal ${MAX_WEIGHT_KG} kg.`)
    .nullable()
    .optional(),

  head_circumference: z
    .number()
    .int("Lingkar kepala harus berupa angka bulat.")
    .min(0, "Lingkar kepala tidak boleh negatif.")
    .max(
      MAX_HEAD_CIRCUMFERENCE_CM,
      `Lingkar kepala maksimal ${MAX_HEAD_CIRCUMFERENCE_CM} cm.`,
    )
    .nullable()
    .optional(),
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

// Khusus checkout online: email wajib supaya struk pasti ada tujuannya.
export const PublicCreatePpdbRegistrationRequestSchema =
  CreatePpdbRegistrationRequestSchema.extend({
    parent_email: requiredEmail("Email orang tua"),
  });

export type CreatePpdbRegistrationRequest = z.infer<
  typeof CreatePpdbRegistrationRequestSchema
> & {
  ip_address: string;
};

export const ACADEMIC_YEAR_PATTERN = /^\d{4}\/\d{4}$/;

export type RegistrantRegion = {
  city: string;
  province: string;
  total: number;
};

const RELIGION_VALUES = Object.keys(RELIGION_LABEL) as [
  keyof typeof RELIGION_LABEL,
  ...(keyof typeof RELIGION_LABEL)[],
];

const SPECIAL_NEEDS_VALUES = Object.keys(SPECIAL_NEEDS_LABEL) as [
  keyof typeof SPECIAL_NEEDS_LABEL,
  ...(keyof typeof SPECIAL_NEEDS_LABEL)[],
];

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `${label} wajib diisi.`)
    .max(max, `${label} maksimal ${max} karakter.`);
}

function optionalText(label: string, max: number) {
  return z
    .string()
    .trim()
    .max(max, `${label} maksimal ${max} karakter.`)
    .nullable()
    .optional()
    .transform((value) => value || null);
}

function optionalDigits(label: string, length: number) {
  return z
    .string()
    .trim()
    .regex(
      new RegExp(`^[0-9]{${length}}$`),
      `${label} harus ${length} digit angka.`,
    )
    .or(z.literal(""))
    .nullable()
    .optional()
    .transform((value) => value || null);
}

export const StudentFormSchema = z.object({
  full_name: personName("Nama anak"),
  gender: z.enum(GENDER_VALUES, { error: "Jenis kelamin wajib dipilih." }),
  nik: nik("NIK anak"),
  nisn: optionalDigits("NISN", 10),
  place_of_birth: birthPlace("Tempat lahir"),
  date_of_birth: birthDate("Tanggal lahir"),
  religion: z.enum(RELIGION_VALUES, { error: "Agama wajib dipilih." }),
  physical_disability: z.enum(SPECIAL_NEEDS_VALUES, {
    error: "Wajib dipilih.",
  }),
  previous_school: requiredText("Asal sekolah", 120),
  previous_school_npsn: optionalDigits("NPSN", 8),
  previous_school_address: optionalText("Alamat sekolah asal", 200),
  address: requiredText("Alamat", 200),
  hamlet: optionalText("Dusun", 80),
  rt_rw: requiredText("RT/RW", 20),
  village: requiredText("Kelurahan", 80),
  postal_code: optionalDigits("Kode pos", 5),
  district: requiredText("Kecamatan", 80),
  city: requiredText("Kabupaten/Kota", 80),
  province: requiredText("Provinsi", 80),
  home_phone: optionalText("Telepon rumah", 20),
  phone: phoneNumber("No. HP"),
  birth_certificate_number: optionalText("No. akta lahir", 60),
  kks_number: optionalText("No. KKS", 40),
  kps_number: optionalText("No. KPS/PKH", 40),
  kip_number: optionalText("No. KIP", 40),
  kip_name: optionalText("Nama di KIP", 80),
  latitude: z.number().min(-90).max(90).nullable().default(null),
  longitude: z.number().min(-180).max(180).nullable().default(null),
  sibling_count: z
    .number({ error: "Jumlah saudara wajib diisi." })
    .int()
    .min(0, "Jumlah saudara tidak valid.")
    .max(MAX_SIBLING_NUMBER, `Jumlah saudara maksimal ${MAX_SIBLING_NUMBER}.`),
});

export type StudentForm = z.infer<typeof StudentFormSchema>;

export const ManualStudentFormSchema = StudentFormSchema.extend({
  nik: blankable(nik("NIK anak")),
  place_of_birth: blankable(birthPlace("Tempat lahir")),
  religion: blankable(
    z.enum(RELIGION_VALUES, { error: "Agama wajib dipilih." }),
  ),
  physical_disability: blankable(
    z.enum(SPECIAL_NEEDS_VALUES, { error: "Wajib dipilih." }),
  ),
  address: blankable(requiredText("Alamat", 200)),
  rt_rw: blankable(requiredText("RT/RW", 20)),
  village: blankable(requiredText("Kelurahan", 80)),
  district: blankable(requiredText("Kecamatan", 80)),
  city: blankable(requiredText("Kabupaten/Kota", 80)),
  province: blankable(requiredText("Provinsi", 80)),
  phone: blankable(phoneNumber("No. HP")),
  sibling_count: blankable(
    z
      .number()
      .int()
      .min(0, "Jumlah saudara tidak valid.")
      .max(
        MAX_SIBLING_NUMBER,
        `Jumlah saudara maksimal ${MAX_SIBLING_NUMBER}.`,
      ),
  ),
});

export type ManualStudentForm = z.infer<typeof ManualStudentFormSchema>;
