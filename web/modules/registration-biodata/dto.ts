import { z } from "zod";
import type { PpdbRegistrationFormRow } from "@/modules/registration/entity";
import type { FormBiodata } from "./entity";
import {
  MAX_HEIGHT_CM,
  MAX_WEIGHT_KG,
} from "@/modules/shared/constant/admission/registration";
import {
  ACHIEVEMENT_CATEGORY_LABEL,
  ACHIEVEMENT_LEVEL_LABEL,
  EDUCATION_LEVEL_LABEL,
  INCOME_RANGE_LABEL,
  LIVING_ARRANGEMENT_LABEL,
  MAX_ACHIEVEMENTS,
  MAX_DISTANCE_KM,
  MAX_TRAVEL_TIME_MINUTES,
  MIN_PARENT_BIRTH_YEAR,
  PARENT_OCCUPATION_LABEL,
  SPECIAL_NEEDS_LABEL,
  TRANSPORTATION_LABEL,
} from "@/modules/shared/constant/admission/registrationForm";
import {
  blankable,
  personName,
  phoneNumber,
} from "@/modules/validation/validators";

const currentYear = new Date().getFullYear();

function optionKeys<T extends Record<string, string>>(labels: T) {
  return Object.keys(labels) as [keyof T & string, ...(keyof T & string)[]];
}

const parentBirthYear = z
  .number({ error: "Tahun lahir wajib diisi." })
  .int()
  .min(MIN_PARENT_BIRTH_YEAR, `Tahun lahir minimal ${MIN_PARENT_BIRTH_YEAR}.`)
  .max(currentYear, "Tahun lahir tidak valid.");

const occupation = z.enum(optionKeys(PARENT_OCCUPATION_LABEL), {
  error: "Pekerjaan wajib dipilih.",
});

const education = z.enum(optionKeys(EDUCATION_LEVEL_LABEL), {
  error: "Pendidikan wajib dipilih.",
});

const incomeRange = z.enum(optionKeys(INCOME_RANGE_LABEL), {
  error: "Penghasilan wajib dipilih.",
});

export const ParentFormSchema = z.object({
  name: personName("Nama"),
  birth_year: parentBirthYear,
  special_needs: z.enum(optionKeys(SPECIAL_NEEDS_LABEL), {
    error: "Wajib dipilih.",
  }),
  nik: z
    .string()
    .trim()
    .regex(/^\d{16}$/, "NIK harus 16 digit angka."),
  occupation,
  education,
  income_range: incomeRange,
  phone: phoneNumber("No. HP")
    .or(z.literal(""))
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export const GuardianFormSchema = z.object({
  name: personName("Nama wali"),
  birth_year: parentBirthYear.nullable().default(null),
  occupation: occupation.nullable().default(null),
  education: education.nullable().default(null),
  income_range: incomeRange.nullable().default(null),
});

export const DetailsFormSchema = z.object({
  living_with: z.enum(optionKeys(LIVING_ARRANGEMENT_LABEL), {
    error: "Jenis tinggal wajib dipilih.",
  }),
  transportation_method: z.enum(optionKeys(TRANSPORTATION_LABEL), {
    error: "Transportasi wajib dipilih.",
  }),
  height: z
    .number({ error: "Tinggi badan wajib diisi." })
    .int()
    .min(30, "Tinggi badan tidak valid.")
    .max(MAX_HEIGHT_CM, `Tinggi badan maksimal ${MAX_HEIGHT_CM} cm.`),
  weight: z
    .number({ error: "Berat badan wajib diisi." })
    .int()
    .min(5, "Berat badan tidak valid.")
    .max(MAX_WEIGHT_KG, `Berat badan maksimal ${MAX_WEIGHT_KG} kg.`),
  distance_km: z
    .number({ error: "Jarak wajib diisi." })
    .min(0, "Jarak tidak valid.")
    .max(MAX_DISTANCE_KM, `Jarak maksimal ${MAX_DISTANCE_KM} km.`),
  travel_time_minutes: z
    .number({ error: "Waktu tempuh wajib diisi." })
    .int()
    .min(0, "Waktu tempuh tidak valid.")
    .max(MAX_TRAVEL_TIME_MINUTES, "Waktu tempuh tidak valid."),
});

export const AchievementFormSchema = z.object({
  category: z.enum(optionKeys(ACHIEVEMENT_CATEGORY_LABEL), {
    error: "Jenis wajib dipilih.",
  }),
  level: z.enum(optionKeys(ACHIEVEMENT_LEVEL_LABEL), {
    error: "Tingkat wajib dipilih.",
  }),
  name: z
    .string()
    .trim()
    .min(1, "Nama prestasi wajib diisi.")
    .max(120, "Nama prestasi maksimal 120 karakter."),
  year: z
    .number({ error: "Tahun wajib diisi." })
    .int()
    .min(2015, "Tahun tidak valid.")
    .max(currentYear, "Tahun tidak valid."),
  organizer: z
    .string()
    .trim()
    .max(120, "Penyelenggara maksimal 120 karakter.")
    .nullable()
    .optional()
    .transform((value) => value || null),
});

export const BiodataFormSchema = z.object({
  father: ParentFormSchema,
  mother: ParentFormSchema,
  guardian: GuardianFormSchema.nullable().default(null),
  details: DetailsFormSchema,
  achievements: z
    .array(AchievementFormSchema)
    .max(MAX_ACHIEVEMENTS, `Prestasi maksimal ${MAX_ACHIEVEMENTS}.`)
    .default([]),
});

export type BiodataForm = z.infer<typeof BiodataFormSchema>;

const ManualParentFormSchema = ParentFormSchema.extend({
  birth_year: blankable(parentBirthYear),
  special_needs: blankable(
    z.enum(optionKeys(SPECIAL_NEEDS_LABEL), { error: "Wajib dipilih." }),
  ),
  nik: blankable(
    z
      .string()
      .trim()
      .regex(/^\d{16}$/, "NIK harus 16 digit angka."),
  ),
  occupation: blankable(occupation),
  education: blankable(education),
  income_range: blankable(incomeRange),
});

const ManualDetailsFormSchema = z.object({
  living_with: blankable(DetailsFormSchema.shape.living_with),
  transportation_method: blankable(
    DetailsFormSchema.shape.transportation_method,
  ),
  height: blankable(DetailsFormSchema.shape.height),
  weight: blankable(DetailsFormSchema.shape.weight),
  distance_km: blankable(DetailsFormSchema.shape.distance_km),
  travel_time_minutes: blankable(DetailsFormSchema.shape.travel_time_minutes),
});

export const ManualBiodataFormSchema = BiodataFormSchema.extend({
  father: ManualParentFormSchema.nullable().default(null),
  mother: ManualParentFormSchema.nullable().default(null),
  details: ManualDetailsFormSchema,
});

export type ManualBiodataForm = z.infer<typeof ManualBiodataFormSchema>;

export type FullFormValues = FormBiodata & {
  student: PpdbRegistrationFormRow["student"];
  parent_email: string | null;
};
