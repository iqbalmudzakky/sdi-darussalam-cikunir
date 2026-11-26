import * as financialStatementService from "@/modules/financial-statement/service";
import { renderReadinessProfilePdf } from "@/modules/export/readinessProfilePdf";
import { renderStatementPdf } from "@/modules/export/statementPdf";
import * as observationService from "@/modules/observation/service";
import * as paymentService from "@/modules/payment/service";
import * as registrationService from "@/modules/registration/service";
import { PROFILE_STATUS_LABEL } from "@/modules/shared/constant/admission/document";
import type {
  DocumentRequestInput,
  DocumentResult,
  LetterRowResponse,
  LettersInput,
} from "./dto";

export async function getLetters(
  input: LettersInput,
): Promise<LetterRowResponse[]> {
  const { registrationId, isPaid } = input;
  const statement =
    await financialStatementService.findStatement(registrationId);
  const statementUrl = `/registrations/${registrationId}/statement`;
  const downloadBase = `/api/documents?registration=${registrationId}&kind=`;

  let profileState: LetterRowResponse["state"] = "ready";
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

  let statementState: LetterRowResponse["state"] = "waiting";
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
    edit_url: input.canWriteStatement ? statementUrl : null,
    download_url: statement ? `${downloadBase}statement` : null,
  };

  const letters =
    input.registrationType === "siswa_baru"
      ? [profile, statementRow]
      : [statementRow];
  return letters;
}

export async function getDocument(
  input: DocumentRequestInput,
): Promise<DocumentResult> {
  const { kind, registrationId, actor } = input;
  const registration = await registrationService.findFullById(registrationId);
  const number = registration?.registration_number ?? registrationId;
  const missing: DocumentResult = { ok: false, reason: "not_found" };
  if (!registration) return missing;

  if (kind === "statement") {
    const statement =
      await financialStatementService.findStatement(registrationId);
    if (!statement) return missing;

    const buffer = await renderStatementPdf(statement.content);
    const result: DocumentResult = {
      ok: true,
      file: { buffer, filename: `Surat-Pernyataan-${number}.pdf` },
    };
    return result;
  }

  const [observation, payments] = await Promise.all([
    observationService.getObservationView(registrationId, actor),
    paymentService.getSummariesByRegistrationIds([registrationId]),
  ]);
  if (!observation?.is_completed) return missing;
  if (payments.get(registrationId)?.payment_status !== "success") {
    const locked: DocumentResult = { ok: false, reason: "locked" };
    return locked;
  }

  const buffer = await renderReadinessProfilePdf(observation);
  const result: DocumentResult = {
    ok: true,
    file: { buffer, filename: `Profil-Kesiapan-${number}.pdf` },
  };
  return result;
}
