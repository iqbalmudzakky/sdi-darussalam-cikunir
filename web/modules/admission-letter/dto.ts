import { z } from "zod";
import type { SessionUser } from "@/modules/auth/dto";
import type { StatementContent } from "./entity";

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
