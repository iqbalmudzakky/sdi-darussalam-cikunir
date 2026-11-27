import { z } from "zod";
import type { SessionUser } from "@/modules/auth/dto";
import type { DecisionLetterContent, StatementContent } from "./entity";

const TextSchema = z.string().trim().max(200, "Isian maksimal 200 karakter.");

const AddressSchema = z.object({
  street: TextSchema,
  rt: TextSchema,
  rw: TextSchema,
  village: TextSchema,
  postal_code: TextSchema,
  district: TextSchema,
  city: TextSchema,
  province: TextSchema,
});

const ParentSchema = z.object({
  name: TextSchema,
  nik: TextSchema,
  occupation: TextSchema,
  phone: TextSchema,
  address: AddressSchema,
});

const StatementSchema = z.object({
  letter_date: z.iso.date("Tanggal surat wajib diisi."),
  father: ParentSchema,
  mother: ParentSchema.extend({ same_address: z.boolean() }),
  child: z.object({
    full_name: TextSchema.min(1, "Nama anak wajib diisi."),
    place_of_birth: TextSchema,
    date_of_birth: TextSchema,
    grade_label: TextSchema,
    academic_year: TextSchema,
  }),
  signers: z.object({
    principal_name: TextSchema,
    director_name: TextSchema,
  }),
});

export const SaveStatementRequestSchema = z.object({
  action: z.enum(["save_statement", "refresh_statement"]),
  statement: StatementSchema,
});

export type SaveStatementRequest = z.infer<typeof SaveStatementRequestSchema>;

export type SaveStatementRequestInput = {
  registrationId: string;
  request: SaveStatementRequest;
  actor: SessionUser;
};

export type StatementFailureReason =
  "not_found" | "invalid_state" | "forbidden_statement";

export type StatementFeeRow = {
  program: string;
  total_label: string;
  discounted_label: string;
};

export type StatementViewResponse = {
  registration_id: string;
  full_name: string;
  registration_number: string | null;
  content: StatementContent;
  fee_rows: StatementFeeRow[];
  deadline_label: string | null;
  is_saved: boolean;
  can_edit: boolean;
  download_url: string;
};

export type SaveStatementResult =
  | { ok: true; statement: StatementViewResponse }
  | { ok: false; reason: StatementFailureReason };

const DecisionLetterSchema = z.object({
  letter_number: z
    .string()
    .trim()
    .min(1, "Nomor surat wajib diisi.")
    .max(60, "Nomor surat maksimal 60 karakter."),
  letter_date: z.iso.date("Tanggal surat wajib diisi."),
  child: z.object({
    full_name: TextSchema.min(1, "Nama anak wajib diisi."),
    previous_school: TextSchema,
    grade_label: TextSchema,
    age_label: TextSchema,
  }),
  payment: z.object({
    deadline: z.iso.date().or(z.literal("")),
    bank_name: TextSchema,
    bank_account_number: TextSchema,
    bank_account_name: TextSchema,
  }),
  signers: z.object({
    principal_name: TextSchema,
    committee_chair_name: TextSchema,
  }),
});

export const SaveDecisionLetterRequestSchema = z.object({
  action: z.enum(["save_decision_letter", "refresh_decision_letter"]),
  letter: DecisionLetterSchema,
});

export type SaveDecisionLetterRequest = z.infer<
  typeof SaveDecisionLetterRequestSchema
>;

export type SaveDecisionLetterRequestInput = {
  registrationId: string;
  request: SaveDecisionLetterRequest;
  actor: SessionUser;
};

export type DecisionLetterFailureReason =
  | "not_found"
  | "invalid_state"
  | "forbidden_letter"
  | "duplicate_letter_number";

export type DecisionLetterViewResponse = {
  registration_id: string;
  full_name: string;
  registration_number: string | null;
  content: DecisionLetterContent;
  title: string;
  result_label: string;
  is_accepted: boolean;
  is_saved: boolean;
  is_locked: boolean;
  can_edit: boolean;
  download_url: string;
};

export type SaveDecisionLetterResult =
  | { ok: true; letter: DecisionLetterViewResponse }
  | { ok: false; reason: DecisionLetterFailureReason };
