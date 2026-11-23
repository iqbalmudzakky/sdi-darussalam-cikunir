import { z } from "zod";
import type { RegistrationPaymentSummary } from "@/modules/payment/entity";
import { ACADEMIC_YEAR_PATTERN } from "@/modules/registration/dto";
import type {
  Gender,
  ParentRelationshipStatus,
  PhysicalDisability,
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

export const UpdateRegistrationRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("reactivate") }),
  z.object({
    action: z.literal("toggle_document"),
    document: z.enum(RECEIVED_DOCUMENT_VALUES),
  }),
]);

export type UpdateRegistrationRequest = z.infer<
  typeof UpdateRegistrationRequestSchema
>;

export type UpdateRegistrationInput = {
  id: string;
  request: UpdateRegistrationRequest;
};

export type UpdateRegistrationFailureReason =
  "not_found" | "invalid_state" | "invalid_document";

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

export type RegistrationDetailResponse = RegistrationListItemResponse &
  RegistrationPaymentSummary &
  RegistrationParentColumns & {
    ip_address: string | null;
    parent_email: string | null;
    student_nik: string | null;
    gender: Gender;
    place_of_birth: string | null;
    date_of_birth: string;
    birth_order: number | null;
    sibling_count: number | null;
    current_address: string | null;
    physical_disability: PhysicalDisability | null;
    previous_school: string;
    nisn: string | null;

    entry_age_label: string | null;
    documents: RegistrationDocumentResponse[];
    can_cancel: boolean;
    can_reactivate: boolean;
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
