import { z } from "zod";
import type { SessionUser } from "@/modules/auth/dto";
import type { RegistrationType } from "@/modules/registration/entity";

export const DocumentKindSchema = z.enum(["statement", "readiness-profile"]);

export type DocumentKind = z.infer<typeof DocumentKindSchema>;

export const DocumentQuerySchema = z.object({
  kind: DocumentKindSchema,
  registration: z.uuid("Pendaftar tidak valid."),
});

export type DocumentRequestInput = {
  kind: DocumentKind;
  registrationId: string;
  actor: SessionUser;
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
  isTested: boolean;
  isPaid: boolean;
  canWriteStatement: boolean;
};

export type LetterRowResponse = {
  kind: DocumentKind;
  title: string;
  subtitle: string | null;
  state: "waiting" | "locked" | "empty" | "ready";
  status_label: string | null;
  edit_url: string | null;
  download_url: string | null;
};
