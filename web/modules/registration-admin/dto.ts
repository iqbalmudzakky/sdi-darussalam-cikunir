import { z } from "zod";
import {
  ScheduleTestRequestSchema,
  type ScheduleOptionsResponse,
  type ScheduleResponse,
} from "@/modules/admission-test/dto";
import type { SessionUser } from "@/modules/auth/dto";
import type { RegistrationPaymentSummary } from "@/modules/payment/entity";
import {
  ACADEMIC_YEAR_PATTERN,
  ManualStudentFormSchema,
} from "@/modules/registration/dto";
import {
  ManualBiodataFormSchema,
  type FullFormValues,
} from "@/modules/registration-biodata/dto";
import type { ParentType } from "@/modules/registration-biodata/entity";
import { TargetGradeSchema } from "@/modules/registration-intake/dto";
import {
  blankable,
  optionalEmail,
  personName,
  phoneNumber,
} from "@/modules/validation/validators";
import type {
  ParentRelationshipStatus,
  PpdbRegistrationExportRow,
  PpdbRegistrationStatus,
  RegistrationProgram,
  RegistrationType,
} from "@/modules/registration/entity";
import {
  RECEIVED_DOCUMENT_LABEL,
  REGISTRATION_PROGRAMS,
  REGISTRATION_STATUSES,
  REGISTRATION_TYPES,
  type ReceivedDocument,
} from "@/modules/shared/constant/registration";

const RECEIVED_DOCUMENT_VALUES = Object.keys(RECEIVED_DOCUMENT_LABEL) as [
  ReceivedDocument,
  ...ReceivedDocument[],
];

const SORT_DIRECTION_VALUES = ["asc", "desc"] as const;

const EditRegistrationBaseSchema = z.object({
  academic_year: z
    .string()
    .regex(ACADEMIC_YEAR_PATTERN, "Tahun ajaran wajib dipilih."),
  program: blankable(z.enum(REGISTRATION_PROGRAMS)),
  contact_name: personName("Nama orang tua"),
  contact_phone: phoneNumber("No. WhatsApp"),
});

const EditRegistrationFormSchema = ManualBiodataFormSchema.extend({
  registration: z.discriminatedUnion("registration_type", [
    EditRegistrationBaseSchema.extend({
      registration_type: z.literal("siswa_baru"),
      target_grade: z.null().default(null),
    }),
    EditRegistrationBaseSchema.extend({
      registration_type: z.literal("pindahan"),
      target_grade: TargetGradeSchema,
    }),
  ]),
  student: ManualStudentFormSchema,
  parent_email: optionalEmail("Email"),
});

export type EditRegistrationForm = z.infer<typeof EditRegistrationFormSchema>;

export const UpdateRegistrationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reactivate") }),
  z.object({
    action: z.literal("toggle_document"),
    document: z.enum(RECEIVED_DOCUMENT_VALUES),
  }),
  z.object({
    action: z.literal("update_form"),
    form: EditRegistrationFormSchema,
  }),
  z.object({
    action: z.literal("schedule"),
    schedule: ScheduleTestRequestSchema,
  }),
  z.object({ action: z.literal("mark_reminded") }),
]);

export type UpdateRegistrationRequest = z.infer<
  typeof UpdateRegistrationRequestSchema
>;

export type UpdateRegistrationInput = {
  id: string;
  request: UpdateRegistrationRequest;
  actor: SessionUser;
};

export type UpdateRegistrationFailureReason =
  | "not_found"
  | "invalid_state"
  | "invalid_document"
  | "duplicate_nik"
  | "invalid_year"
  | "manual_duplicate"
  | "invalid_interviewer"
  | "forbidden_interviewer";

export type UpdateRegistrationResult =
  | { ok: true; registration: RegistrationDetailResponse }
  | { ok: false; reason: UpdateRegistrationFailureReason };

export const ListRegistrationsQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
  statuses: z.array(z.enum(REGISTRATION_STATUSES)).default([]),
  academic_year: z
    .string()
    .regex(ACADEMIC_YEAR_PATTERN)
    .or(z.literal(""))
    .default(""),
  program: z.enum(REGISTRATION_PROGRAMS).or(z.literal("")).default(""),
  registration_type: z.enum(REGISTRATION_TYPES).or(z.literal("")).default(""),
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

export type RegistrationListItemResponse = {
  id: string;
  registration_number: string | null;
  registration_type: RegistrationType;
  program: RegistrationProgram | null;
  target_grade: number | null;
  academic_year: string | null;
  status: PpdbRegistrationStatus;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  full_name: string;
  has_full_form: boolean;
  is_paid: boolean;
  received_document_count: number;
  required_document_count: number;
};

export type RegistrationDocumentResponse = {
  code: ReceivedDocument;
  label: string;
  received: boolean;
};

export type RegistrationFormRowResponse = {
  label: string;
  value: string | null;
};

export type RegistrationFormSectionResponse = {
  key:
    | "identity"
    | "address"
    | "previous_school"
    | "periodic"
    | "social_aid"
    | "contact"
    | "payment";
  title: string;
  rows: RegistrationFormRowResponse[];
};

export type RegistrationFormParentResponse = {
  key: ParentType;
  title: string;
  rows: RegistrationFormRowResponse[] | null;
};

export type RegistrationFormAchievementResponse = {
  name: string;
  category: string;
  level: string;
  year: number;
  organizer: string | null;
};

export type RegistrationFullFormResponse = {
  child: RegistrationFormSectionResponse[];
  parents: RegistrationFormParentResponse[];
  contact: RegistrationFormSectionResponse[];
  achievements: RegistrationFormAchievementResponse[];
};

export type RegistrationDetailResponse = RegistrationListItemResponse & {
  date_of_birth: string;
  previous_school: string;
  entry_age_label: string | null;
  documents: RegistrationDocumentResponse[];
  can_cancel: boolean;
  can_reactivate: boolean;
  can_send_form_link: boolean;
  schedule: ScheduleResponse | null;
  schedule_options: ScheduleOptionsResponse;
  full_form: RegistrationFullFormResponse | null;
};

export type RegistrationEditFormResponse = {
  id: string;
  registration_number: string | null;
  registration_type: RegistrationType;
  registration: {
    program: RegistrationProgram | null;
    target_grade: number | null;
    academic_year: string | null;
    contact_name: string | null;
    contact_phone: string | null;
  };
  values: FullFormValues;
};

export type RegistrationListResponse = {
  items: RegistrationListItemResponse[];
  total: number;
  has_more: boolean;
  academic_years: string[];
};

export type RegistrationParentColumns = {
  father_status: ParentRelationshipStatus | null;
  father_name: string | null;
  father_nik: string | null;
  father_place_of_birth: string | null;
  father_date_of_birth: string | null;
  father_phone: string | null;
  father_income: number | null;
  mother_status: ParentRelationshipStatus | null;
  mother_name: string | null;
  mother_nik: string | null;
  mother_place_of_birth: string | null;
  mother_date_of_birth: string | null;
  mother_phone: string | null;
  mother_income: number | null;
};

export type RegistrationExportItem = PpdbRegistrationExportRow &
  RegistrationParentColumns &
  RegistrationPaymentSummary;
