import { z } from "zod";
import {
  ACADEMIC_YEAR_PATTERN,
  GENDER_VALUES,
} from "@/modules/registration/dto";
import {
  REGISTRATION_PROGRAMS,
  REGISTRATION_TYPES,
  TARGET_GRADES,
} from "@/modules/shared/constant/registration";
import {
  birthDate,
  personName,
  phoneNumber,
} from "@/modules/validation/validators";

const OptionalEmailSchema = z
  .string()
  .trim()
  .email("Email tidak valid.")
  .or(z.literal(""))
  .nullable()
  .optional()
  .transform((value) => value || null);

const ShortRegistrationBaseSchema = z.object({
  full_name: personName("Nama anak"),
  gender: z.enum(GENDER_VALUES, { error: "Jenis kelamin wajib dipilih." }),
  date_of_birth: birthDate("Tanggal lahir"),
  previous_school: z
    .string()
    .trim()
    .min(1, "Asal sekolah wajib diisi.")
    .max(120, "Asal sekolah maksimal 120 karakter."),
  program: z.enum(REGISTRATION_PROGRAMS, { error: "Program wajib dipilih." }),
  academic_year: z
    .string()
    .regex(ACADEMIC_YEAR_PATTERN, "Tahun ajaran wajib dipilih."),
  contact_name: personName("Nama orang tua"),
  contact_phone: phoneNumber("No. WhatsApp"),
  parent_email: OptionalEmailSchema,
});

export const ShortRegistrationRequestSchema = z.discriminatedUnion(
  "registration_type",
  [
    ShortRegistrationBaseSchema.extend({
      registration_type: z.literal("siswa_baru"),
      target_grade: z.null().default(null),
    }),
    ShortRegistrationBaseSchema.extend({
      registration_type: z.literal("pindahan"),
      target_grade: z
        .number({ error: "Kelas tujuan wajib dipilih." })
        .int()
        .refine((value) => TARGET_GRADES.some((grade) => grade === value), {
          message: "Kelas tujuan tidak valid.",
        }),
    }),
  ],
);

export type ShortRegistrationRequest = z.infer<
  typeof ShortRegistrationRequestSchema
>;

export type CreateShortRegistrationInput = {
  request: ShortRegistrationRequest;
  ipAddress: string;
};

export type ShortRegistrationBlockReason =
  "closed" | "invalid_year" | "rate_limited" | "duplicate";

export type RegistrationFlowStepResponse = {
  label: string;
  state: "done" | "current" | "upcoming";
  badge: string | null;
  fee: number | null;
};

export type CreateShortRegistrationResult =
  | {
      ok: true;
      registration_number: string;
      whatsapp_url: string | null;
      flow_steps: RegistrationFlowStepResponse[];
    }
  | {
      ok: false;
      reason: ShortRegistrationBlockReason;
      whatsapp_url: string | null;
    };

export const ShortFormOptionsQuerySchema = z.object({
  registration_type: z.enum(REGISTRATION_TYPES).catch("siswa_baru"),
  full_name: z.string().trim().max(80).catch(""),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .catch(undefined),
  academic_year: z
    .string()
    .regex(ACADEMIC_YEAR_PATTERN)
    .optional()
    .catch(undefined),
});

export type ShortFormOptionsQuery = z.infer<typeof ShortFormOptionsQuerySchema>;

export type ShortFormOptionsResponse = {
  open: boolean;
  academic_years: string[];
  target_grades: number[];
  under_age: {
    minimum_years: number;
    cutoff_year: number;
    whatsapp_url: string | null;
  } | null;
};
