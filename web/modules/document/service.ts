import type { DecisionLetterRow } from "@/modules/admission-letter/entity";
import * as admissionLetterService from "@/modules/admission-letter/service";
import * as admissionSettingsService from "@/modules/admission-settings/service";
import type { SessionUser } from "@/modules/auth/dto";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "@/modules/crypto/tokens";
import { withDbLogging } from "@/modules/db/errors";
import { renderDecisionLetterPdf } from "@/modules/export/decisionLetterPdf";
import { renderReadinessProfilePdf } from "@/modules/export/readinessProfilePdf";
import { renderStatementPdf } from "@/modules/export/statementPdf";
import * as observationService from "@/modules/observation/service";
import * as paymentService from "@/modules/payment/service";
import type { PpdbRegistrationFullRow } from "@/modules/registration/entity";
import * as registrationService from "@/modules/registration/service";
import {
  DECISION_LETTER_STATUS_LABEL,
  DOCUMENT_LINK_TTL_DAYS,
  PROFILE_STATUS_LABEL,
} from "@/modules/shared/constant/admission/document";
import { DECISION_LETTER_TEXT } from "@/modules/shared/constant/admission/letter";
import { DECIDED_STATUSES } from "@/modules/shared/constant/admission/registration";
import { getSiteUrl } from "@/modules/shared/web/siteUrl";
import { buildWhatsAppLink } from "@/modules/shared/web/whatsapp";
import * as repository from "./repository";
import type {
  DocumentKind,
  DocumentRequestInput,
  DocumentResult,
  DocumentSendState,
  LetterRowResponse,
  LetterState,
  LettersInput,
  LettersResponse,
  SendDocumentsFailureReason,
  SendDocumentsResult,
  SharedDocumentInput,
  SharedDocumentResponse,
  SharedDocumentsResult,
} from "./dto";
import type { DocumentLink, NewDocumentLink } from "./entity";

type SharedSource = {
  registration: PpdbRegistrationFullRow;
  isPaid: boolean;
  isTested: boolean;
  decisionLetter: DecisionLetterRow | null;
};

type PaidDocumentInput = {
  kind: DocumentKind;
  registration: PpdbRegistrationFullRow;
  actor: SessionUser | null;
};

export async function getLetters(
  input: LettersInput,
): Promise<LettersResponse> {
  const { registrationId, isPaid, decision, decisionLetter } = input;
  const statement = await admissionLetterService.findStatement(registrationId);
  const editBase = `/registrations/${registrationId}`;
  const downloadBase = `/api/documents?registration=${registrationId}&kind=`;

  let profileState: LetterState = "ready";
  if (!input.isTested) profileState = "waiting";
  else if (!isPaid) profileState = "locked";
  const profile: LetterRowResponse = {
    kind: "readiness-profile",
    title: "Profil Kesiapan",
    subtitle: null,
    state: profileState,
    status_label: PROFILE_STATUS_LABEL[profileState],
    edit_url: null,
    download_url:
      profileState === "ready" ? `${downloadBase}readiness-profile` : null,
  };

  let statementState: LetterState = "waiting";
  if (statement) statementState = "ready";
  else if (input.canWriteStatement) statementState = "empty";
  const letterDate = statement?.content.letter_date;
  const statementRow: LetterRowResponse = {
    kind: "statement",
    title: "Surat pernyataan",
    subtitle: letterDate
      ? `Tanggal surat ${letterDate.split("-").reverse().join("/")}`
      : null,
    state: statementState,
    status_label: statementState === "waiting" ? "Belum dibuat" : null,
    edit_url: input.canWriteStatement ? `${editBase}/statement` : null,
    download_url: statement ? `${downloadBase}statement` : null,
  };

  let decisionState: LetterState = "waiting";
  if (decisionLetter) decisionState = isPaid ? "ready" : "locked";
  else if (input.canWriteDecisionLetter) decisionState = "empty";
  const decisionRow: LetterRowResponse = {
    kind: "decision-letter",
    title: DECISION_LETTER_TEXT[decision ?? "accepted"].title,
    subtitle: decisionLetter?.content.letter_number ?? null,
    state: decisionState,
    status_label:
      decisionState === "waiting" && decision
        ? "Belum dibuat"
        : DECISION_LETTER_STATUS_LABEL[decisionState],
    edit_url: input.canWriteDecisionLetter
      ? `${editBase}/decision-letter`
      : null,
    download_url:
      decisionState === "ready" ? `${downloadBase}decision-letter` : null,
  };

  const isNewStudent = input.registrationType === "siswa_baru";
  const hasSharable = (isNewStudent && input.isTested) || decisionLetter;
  let sendState: DocumentSendState = "hidden";
  if (hasSharable) sendState = isPaid ? "ready" : "locked";
  const letters: LettersResponse = {
    rows: isNewStudent
      ? [profile, statementRow, decisionRow]
      : [statementRow, decisionRow],
    send_state: sendState,
  };
  return letters;
}

export async function getDocument(
  input: DocumentRequestInput,
): Promise<DocumentResult> {
  const { kind, registrationId, actor } = input;
  const registration = await registrationService.findFullById(registrationId);
  const missing: DocumentResult = { ok: false, reason: "not_found" };
  if (!registration) return missing;

  if (kind !== "statement") {
    const paidInput: PaidDocumentInput = {
      kind,
      registration,
      actor,
    };
    return renderPaidDocument(paidInput);
  }

  const statement = await admissionLetterService.findStatement(registrationId);
  if (!statement) return missing;

  const number = registration.registration_number ?? registrationId;
  const buffer = await renderStatementPdf(statement.content);
  const result: DocumentResult = {
    ok: true,
    file: { buffer, filename: `Surat-Pernyataan-${number}.pdf` },
  };
  return result;
}

export async function getSharedDocument(
  input: SharedDocumentInput,
): Promise<DocumentResult> {
  const link = await findLink(input.token);
  const registration = link
    ? await registrationService.findFullById(link.registration_id)
    : null;
  if (!registration || input.kind === "statement") {
    const missing: DocumentResult = { ok: false, reason: "not_found" };
    return missing;
  }

  const paidInput: PaidDocumentInput = {
    kind: input.kind,
    registration,
    actor: null,
  };
  return renderPaidDocument(paidInput);
}

export async function sendDocuments(
  registrationId: string,
  actorId: string,
): Promise<SendDocumentsResult> {
  const registration = await registrationService.findFullById(registrationId);
  const source = registration ? await loadSharedSource(registration) : null;
  const kinds = source ? listSharedKinds(source) : [];

  let failure: SendDocumentsFailureReason | null = null;
  if (!registration || !source) failure = "not_found";
  else if (!source.isPaid) failure = "not_paid";
  else if (kinds.length === 0) failure = "no_documents";
  else if (!registration.contact_phone) failure = "no_contact";
  if (failure || !registration) {
    const rejected: SendDocumentsResult = {
      ok: false,
      reason: failure ?? "not_found",
    };
    return rejected;
  }

  const token = generateRefreshToken();
  const ttlMilliseconds = DOCUMENT_LINK_TTL_DAYS * 24 * 60 * 60 * 1000;
  const expiresAtMilliseconds = Date.now() + ttlMilliseconds;
  const link: NewDocumentLink = {
    registrationId,
    tokenHash: hashRefreshToken(token),
    expiresAt: new Date(expiresAtMilliseconds),
    createdBy: actorId,
  };
  await withDbLogging("document.upsertLink", () => repository.upsertLink(link));

  const message = [
    "Assalamu'alaikum, berikut dokumen PMB SDI Darussalam Cikunir.",
    `Nama anak: ${registration.full_name}\nNo. pendaftaran: ${registration.registration_number ?? "-"}`,
    `${getSiteUrl()}/dokumen/${token}`,
    `Link berlaku ${DOCUMENT_LINK_TTL_DAYS} hari.`,
  ].join("\n\n");
  const result: SendDocumentsResult = {
    ok: true,
    whatsapp_url: buildWhatsAppLink(registration.contact_phone, message),
  };
  return result;
}

export async function getSharedDocuments(
  token: string,
): Promise<SharedDocumentsResult> {
  const link = await findLink(token);
  const registration = link
    ? await registrationService.findFullById(link.registration_id)
    : null;
  const source = registration ? await loadSharedSource(registration) : null;
  const kinds = source?.isPaid ? listSharedKinds(source) : [];

  if (!registration || kinds.length === 0) {
    const contactPhone = await admissionSettingsService.getContactPhone();
    const message = [
      "Assalamu'alaikum, link dokumen PMB SDI Darussalam Cikunir saya sudah tidak berlaku.",
      registration && `Nama anak: ${registration.full_name}`,
      "Mohon dikirim link baru.",
    ]
      .filter(Boolean)
      .join("\n\n");
    const expired: SharedDocumentsResult = {
      status: "expired",
      whatsapp_url: contactPhone
        ? buildWhatsAppLink(contactPhone, message)
        : null,
    };
    return expired;
  }

  const decisionTitle =
    DECISION_LETTER_TEXT[
      registration.status === "rejected" ? "rejected" : "accepted"
    ].title;
  const documents = kinds.map((kind) => {
    const document: SharedDocumentResponse = {
      kind,
      title: kind === "decision-letter" ? decisionTitle : "Profil Kesiapan",
      download_url: `/api/documents?token=${encodeURIComponent(token)}&kind=${kind}`,
    };
    return document;
  });
  const valid: SharedDocumentsResult = {
    status: "valid",
    full_name: registration.full_name,
    registration_number: registration.registration_number,
    registration_type: registration.registration_type,
    target_grade: registration.target_grade,
    program: registration.program,
    academic_year: registration.academic_year,
    documents,
  };
  return valid;
}

async function renderPaidDocument(
  input: PaidDocumentInput,
): Promise<DocumentResult> {
  const { kind, registration } = input;
  const id = registration.id;
  const registrationIds = [id];
  const [payments, observation, decisionLetter] = await Promise.all([
    paymentService.getSummariesByRegistrationIds(registrationIds),
    kind === "readiness-profile"
      ? observationService.getObservationView(id, input.actor)
      : null,
    kind === "decision-letter"
      ? admissionLetterService.findDecisionLetter(id)
      : null,
  ]);
  const isDecided = DECIDED_STATUSES.includes(registration.status);
  const hasDocument =
    observation?.is_completed || (decisionLetter !== null && isDecided);
  if (!hasDocument) {
    const missing: DocumentResult = { ok: false, reason: "not_found" };
    return missing;
  }
  if (payments.get(id)?.payment_status !== "success") {
    const locked: DocumentResult = { ok: false, reason: "locked" };
    return locked;
  }

  const number = registration.registration_number ?? id;
  const decisionInput = decisionLetter && {
    content: decisionLetter.content,
    isAccepted: registration.status === "accepted",
  };
  const buffer = decisionInput
    ? await renderDecisionLetterPdf(decisionInput)
    : observation && (await renderReadinessProfilePdf(observation));
  const filename = decisionInput
    ? `Surat-Keterangan-${number}.pdf`
    : `Profil-Kesiapan-${number}.pdf`;
  const result: DocumentResult = buffer
    ? { ok: true, file: { buffer, filename } }
    : { ok: false, reason: "not_found" };
  return result;
}

async function loadSharedSource(
  registration: PpdbRegistrationFullRow,
): Promise<SharedSource> {
  const isNewStudent = registration.registration_type === "siswa_baru";
  const registrationIds = [registration.id];
  const [payments, observation, decisionLetter] = await Promise.all([
    paymentService.getSummariesByRegistrationIds(registrationIds),
    isNewStudent ? observationService.getSummary(registration.id) : null,
    admissionLetterService.findDecisionLetter(registration.id),
  ]);
  const source: SharedSource = {
    registration,
    isPaid: payments.get(registration.id)?.payment_status === "success",
    isTested: observation?.state === "tested",
    decisionLetter,
  };
  return source;
}

function listSharedKinds(source: SharedSource): DocumentKind[] {
  const isDecided = DECIDED_STATUSES.includes(source.registration.status);
  const kinds: DocumentKind[] = [];
  if (source.decisionLetter && isDecided) kinds.push("decision-letter");
  if (source.isTested) kinds.push("readiness-profile");
  return kinds;
}

async function findLink(token: string): Promise<DocumentLink | null> {
  const tokenHash = hashRefreshToken(token);
  return withDbLogging("document.findActiveLink", () =>
    repository.findActiveLink(tokenHash),
  );
}
