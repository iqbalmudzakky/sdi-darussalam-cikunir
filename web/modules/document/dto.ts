import { z } from "zod";
import type { DecisionResult } from "@/modules/admission-decision/dto";
import type { DecisionLetterRow } from "@/modules/admission-letter/entity";
import type { SessionUser } from "@/modules/auth/dto";
import type {
  RegistrationProgram,
  RegistrationType,
} from "@/modules/registration/entity";

export const DocumentKindSchema = z.enum([
  "statement",
  "readiness-profile",
  "decision-letter",
]);

export type DocumentKind = z.infer<typeof DocumentKindSchema>;

export const DocumentQuerySchema = z
  .object({
    kind: DocumentKindSchema,
    registration: z.uuid("Pendaftar tidak valid.").nullable(),
    token: z.string().min(1).max(200).nullable(),
  })
  .refine((query) => (query.registration === null) !== (query.token === null), {
    error: "Dokumen tidak valid.",
  });

export type DocumentRequestInput = {
  kind: DocumentKind;
  registrationId: string;
  actor: SessionUser;
};

export type SharedDocumentInput = {
  kind: DocumentKind;
  token: string;
};

export type DocumentFile = {
  buffer: Buffer;
  filename: string;
};

export type DocumentFailureReason = "not_found" | "locked";

export type DocumentResult =
  | { ok: true; file: DocumentFile }
  | { ok: false; reason: DocumentFailureReason };

export type LettersInput = {
  registrationId: string;
  registrationType: RegistrationType;
  decision: DecisionResult | null;
  decisionLetter: DecisionLetterRow | null;
  isTested: boolean;
  isPaid: boolean;
  canWriteStatement: boolean;
  canWriteDecisionLetter: boolean;
};

export type LetterState = "waiting" | "locked" | "empty" | "ready";

export type LetterRowResponse = {
  kind: DocumentKind;
  title: string;
  subtitle: string | null;
  state: LetterState;
  status_label: string | null;
  edit_url: string | null;
  download_url: string | null;
};

export type DocumentSendState = "hidden" | "locked" | "ready";

export type LettersResponse = {
  rows: LetterRowResponse[];
  send_state: DocumentSendState;
};

export type SendDocumentsFailureReason =
  "not_found" | "not_paid" | "no_documents" | "no_contact";

export type SendDocumentsResult =
  | { ok: true; whatsapp_url: string }
  | { ok: false; reason: SendDocumentsFailureReason };

export type SharedDocumentResponse = {
  kind: DocumentKind;
  title: string;
  download_url: string;
};

export type SharedDocumentsResult =
  | {
      status: "valid";
      full_name: string;
      registration_number: string | null;
      registration_type: RegistrationType;
      target_grade: number | null;
      program: RegistrationProgram | null;
      academic_year: string | null;
      documents: SharedDocumentResponse[];
    }
  | { status: "expired"; whatsapp_url: string | null };
