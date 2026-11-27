import * as admissionDecisionService from "@/modules/admission-decision/service";
import type { AdmissionSettingsRow } from "@/modules/admission-settings/entity";
import * as admissionSettingsService from "@/modules/admission-settings/service";
import * as admissionTestService from "@/modules/admission-test/service";
import type { SessionUser } from "@/modules/auth/dto";
import { withDbLogging } from "@/modules/db/errors";
import type { RegistrationParentRow } from "@/modules/registration-biodata/entity";
import * as registrationBiodataService from "@/modules/registration-biodata/service";
import * as registrationService from "@/modules/registration/service";
import * as paymentService from "@/modules/payment/service";
import type { PpdbRegistrationFullRow } from "@/modules/registration/entity";
import {
  DECISION_LETTER_TEXT,
  ENTRY_AGE_NOTE,
  LETTER_NUMBER_CODE,
  LETTER_NUMBER_PATTERN,
  NUMBER_WORDS,
  ROMAN_NUMERALS,
} from "@/modules/shared/constant/admission/letter";
import {
  DECIDED_STATUSES,
  MINIMUM_ENTRY_AGE_YEARS,
  REGISTRATION_PROGRAM_LABEL,
} from "@/modules/shared/constant/admission/registration";
import { calculateEntryAge } from "@/modules/shared/date/entryAge";
import { PARENT_OCCUPATION_LABEL } from "@/modules/shared/constant/admission/registrationForm";
import { jakartaDateKey } from "@/modules/shared/date/jakartaDate";
import { toLetterDate } from "@/modules/shared/date/letterDate";
import { formatRupiah } from "@/modules/shared/format/rupiah";
import * as repository from "./repository";
import type {
  DecisionLetterFailureReason,
  DecisionLetterViewResponse,
  SaveDecisionLetterRequestInput,
  SaveDecisionLetterResult,
  SaveStatementRequestInput,
  SaveStatementResult,
  StatementFailureReason,
  StatementViewResponse,
} from "./dto";
import type {
  DecisionLetterContent,
  DecisionLetterRow,
  LetterSequenceInput,
  SaveDecisionLetterInput,
  SaveStatementInput,
  StatementAddress,
  StatementContent,
  StatementFees,
  StatementParent,
  StatementRow,
} from "./entity";

export async function getStatementView(
  registrationId: string,
  actor: SessionUser,
): Promise<StatementViewResponse | null> {
  const [registration, row, interviewerIds] = await Promise.all([
    registrationService.findFullById(registrationId),
    withDbLogging("admissionLetter.findStatement", () =>
      repository.findStatement(registrationId),
    ),
    admissionTestService.findInterviewerIds(registrationId),
  ]);
  if (!registration) return null;

  const content = row?.content ?? (await buildDraft(registrationId));
  const canEdit =
    registration.status !== "cancelled" &&
    admissionDecisionService.canDecideFor(actor, interviewerIds);
  const { fees } = content;
  const programs = [
    ["Tahfizh", fees.tahfizh_yearly_fee + fees.tahfizh_july_fee],
    ["Unggulan", fees.unggulan_yearly_fee + fees.unggulan_july_fee],
  ] as const;
  const feeRows = programs.map(([program, total]) => {
    const darussalamTotal = total - fees.darussalam_discount;
    const otherTotal = total - fees.other_discount;
    const feeRow = {
      program,
      total_label: formatRupiah(total),
      discounted_label: `${formatRupiah(darussalamTotal)} / ${formatRupiah(otherTotal)}`,
    };
    return feeRow;
  });

  const view: StatementViewResponse = {
    registration_id: registrationId,
    full_name: registration.full_name,
    registration_number: registration.registration_number,
    content,
    fee_rows: feeRows,
    deadline_label: fees.payment_deadline
      ? toLetterDate(fees.payment_deadline).dateLabel
      : null,
    is_saved: row !== null,
    download_url: `/api/documents?registration=${registrationId}&kind=statement`,
    can_edit: canEdit,
  };
  return view;
}

export async function saveStatement(
  input: SaveStatementRequestInput,
): Promise<SaveStatementResult> {
  const { registrationId, request, actor } = input;
  const [registration, row, interviewerIds] = await Promise.all([
    registrationService.findFullById(registrationId),
    withDbLogging("admissionLetter.findStatement", () =>
      repository.findStatement(registrationId),
    ),
    admissionTestService.findInterviewerIds(registrationId),
  ]);

  let failure: StatementFailureReason | null = null;
  if (!registration) failure = "not_found";
  else if (registration.status === "cancelled") failure = "invalid_state";
  else if (!admissionDecisionService.canDecideFor(actor, interviewerIds)) {
    failure = "forbidden_statement";
  }
  if (failure) {
    const rejected: SaveStatementResult = { ok: false, reason: failure };
    return rejected;
  }

  const useLatestFees = request.action === "refresh_statement" || !row;
  const fees = useLatestFees ? await getLatestFees() : row.content.fees;
  const content: StatementContent = { ...request.statement, fees };
  const saveInput: SaveStatementInput = {
    registrationId,
    content,
    actorId: actor.id,
  };
  await withDbLogging("admissionLetter.saveStatement", () =>
    repository.saveStatement(saveInput),
  );

  const statement = await getStatementView(registrationId, actor);
  const result: SaveStatementResult = statement
    ? { ok: true, statement }
    : { ok: false, reason: "not_found" };
  return result;
}

export async function findStatement(
  registrationId: string,
): Promise<StatementRow | null> {
  return withDbLogging("admissionLetter.findStatement", () =>
    repository.findStatement(registrationId),
  );
}

export async function getDecisionLetterView(
  registrationId: string,
  actor: SessionUser,
): Promise<DecisionLetterViewResponse | null> {
  const registrationIds = [registrationId];
  const [registration, row, interviewerIds, payments] = await Promise.all([
    registrationService.findFullById(registrationId),
    findDecisionLetter(registrationId),
    admissionTestService.findInterviewerIds(registrationId),
    paymentService.getSummariesByRegistrationIds(registrationIds),
  ]);
  const status = registration?.status;
  if (!registration || (status !== "accepted" && status !== "rejected")) {
    return null;
  }

  const content = row?.content ?? (await buildDecisionDraft(registration));
  const text = DECISION_LETTER_TEXT[status];
  const isPaid = payments.get(registrationId)?.payment_status === "success";

  const view: DecisionLetterViewResponse = {
    registration_id: registrationId,
    full_name: registration.full_name,
    registration_number: registration.registration_number,
    content,
    title: text.title,
    result_label: text.result,
    is_accepted: status === "accepted",
    is_saved: row !== null,
    is_locked: !isPaid,
    can_edit: admissionDecisionService.canDecideFor(actor, interviewerIds),
    download_url: `/api/documents?registration=${registrationId}&kind=decision-letter`,
  };
  return view;
}

export async function saveDecisionLetter(
  input: SaveDecisionLetterRequestInput,
): Promise<SaveDecisionLetterResult> {
  const { registrationId, request, actor } = input;
  const { letter } = request;
  const [registration, row, interviewerIds] = await Promise.all([
    registrationService.findFullById(registrationId),
    findDecisionLetter(registrationId),
    admissionTestService.findInterviewerIds(registrationId),
  ]);
  const numberMatch = letter.letter_number.match(LETTER_NUMBER_PATTERN);
  const letterYear = numberMatch
    ? Number(numberMatch[2])
    : Number(letter.letter_date.slice(0, 4));
  const letterSequence = numberMatch ? Number(numberMatch[1]) : null;
  const sequenceInput: LetterSequenceInput = {
    registrationId,
    letterYear,
    letterSequence: letterSequence ?? 0,
  };
  const isNumberTaken =
    letterSequence !== null &&
    (await withDbLogging("admissionLetter.existsLetterSequence", () =>
      repository.existsLetterSequence(sequenceInput),
    ));

  let failure: DecisionLetterFailureReason | null = null;
  if (!registration) failure = "not_found";
  else if (!DECIDED_STATUSES.includes(registration.status)) {
    failure = "invalid_state";
  } else if (!admissionDecisionService.canDecideFor(actor, interviewerIds)) {
    failure = "forbidden_letter";
  } else if (isNumberTaken) failure = "duplicate_letter_number";
  if (failure || !registration) {
    const rejected: SaveDecisionLetterResult = {
      ok: false,
      reason: failure ?? "not_found",
    };
    return rejected;
  }

  const isRefresh = request.action === "refresh_decision_letter";
  const settings =
    isRefresh || !row ? await admissionSettingsService.getSettings() : null;
  const content: DecisionLetterContent = {
    ...letter,
    entry_year: row?.content.entry_year ?? toEntryYear(registration),
    payment: settings && isRefresh ? toLetterPayment(settings) : letter.payment,
    contacts: settings?.letter_contacts ?? row?.content.contacts ?? [],
  };
  const saveInput: SaveDecisionLetterInput = {
    registrationId,
    content,
    letterYear,
    letterSequence,
    actorId: actor.id,
  };
  await withDbLogging("admissionLetter.saveDecisionLetter", () =>
    repository.saveDecisionLetter(saveInput),
  );

  const view = await getDecisionLetterView(registrationId, actor);
  const result: SaveDecisionLetterResult = view
    ? { ok: true, letter: view }
    : { ok: false, reason: "not_found" };
  return result;
}

export async function findDecisionLetter(
  registrationId: string,
): Promise<DecisionLetterRow | null> {
  return withDbLogging("admissionLetter.findDecisionLetter", () =>
    repository.findDecisionLetter(registrationId),
  );
}

async function buildDraft(registrationId: string): Promise<StatementContent> {
  const registrationIds = [registrationId];
  const [form, parents, settings] = await Promise.all([
    registrationService.findFormById(registrationId),
    registrationBiodataService.listParentsByRegistrationIds(registrationIds),
    admissionSettingsService.getSettings(),
  ]);
  const student = form?.student;
  const [rt = "", rw = ""] = (student?.rt_rw ?? "").split("/");
  const address: StatementAddress = {
    street: student?.address ?? "",
    rt: rt.trim(),
    rw: rw.trim(),
    village: student?.village ?? "",
    postal_code: student?.postal_code ?? "",
    district: student?.district ?? "",
    city: student?.city ?? "",
    province: student?.province ?? "",
  };
  const father = parents.find((item) => item.parent_type === "father");
  const mother = parents.find((item) => item.parent_type === "mother");
  const targetGrade = form?.target_grade ?? 1;

  const draft: StatementContent = {
    letter_date: jakartaDateKey(new Date()),
    father: toStatementParent(father, address),
    mother: { ...toStatementParent(mother, address), same_address: true },
    child: {
      full_name: (student?.full_name ?? "").toUpperCase(),
      place_of_birth: student?.place_of_birth ?? "",
      date_of_birth: student?.date_of_birth ?? "",
      grade_label: `${targetGrade} (${NUMBER_WORDS[targetGrade].toUpperCase()})`,
      academic_year: form?.academic_year ?? "",
    },
    fees: toStatementFees(settings),
    signers: {
      principal_name: settings.principal_name,
      director_name: settings.director_name,
    },
  };
  return draft;
}

async function getLatestFees(): Promise<StatementFees> {
  const settings = await admissionSettingsService.getSettings();
  return toStatementFees(settings);
}

function toStatementFees(settings: AdmissionSettingsRow): StatementFees {
  const fees: StatementFees = {
    tahfizh_yearly_fee: settings.tahfizh_yearly_fee,
    tahfizh_july_fee: settings.tahfizh_july_fee,
    unggulan_yearly_fee: settings.unggulan_yearly_fee,
    unggulan_july_fee: settings.unggulan_july_fee,
    darussalam_discount: settings.darussalam_discount,
    other_discount: settings.other_discount,
    payment_deadline: settings.payment_deadline,
  };
  return fees;
}

function toStatementParent(
  parent: RegistrationParentRow | undefined,
  address: StatementAddress,
): StatementParent {
  const occupation = parent?.occupation as
    keyof typeof PARENT_OCCUPATION_LABEL | null | undefined;
  const statementParent: StatementParent = {
    name: parent?.name.toUpperCase() ?? "",
    nik: parent?.nik ?? "",
    occupation: occupation ? PARENT_OCCUPATION_LABEL[occupation] : "",
    phone: parent?.phone ?? "",
    address,
  };
  return statementParent;
}

async function buildDecisionDraft(
  registration: PpdbRegistrationFullRow,
): Promise<DecisionLetterContent> {
  const letterDate = jakartaDateKey(new Date());
  const letterYear = Number(letterDate.slice(0, 4));
  const letterMonth = Number(letterDate.slice(5, 7));
  const [settings, lastSequence] = await Promise.all([
    admissionSettingsService.getSettings(),
    withDbLogging("admissionLetter.findLastLetterSequence", () =>
      repository.findLastLetterSequence(letterYear),
    ),
  ]);
  const sequence = String(lastSequence + 1).padStart(3, "0");
  const grade = registration.target_grade ?? 1;
  const program = registration.program
    ? REGISTRATION_PROGRAM_LABEL[registration.program]
    : "";
  const entryAge = registration.academic_year
    ? calculateEntryAge(registration.date_of_birth, registration.academic_year)
    : null;
  const ageNote =
    entryAge && entryAge.years >= MINIMUM_ENTRY_AGE_YEARS
      ? ENTRY_AGE_NOTE.enough
      : ENTRY_AGE_NOTE.special;

  const draft: DecisionLetterContent = {
    letter_number: `${sequence}.${LETTER_NUMBER_CODE}/${ROMAN_NUMERALS[letterMonth]}/${letterYear}`,
    letter_date: letterDate,
    entry_year: toEntryYear(registration),
    child: {
      full_name: registration.full_name,
      previous_school: registration.previous_school,
      grade_label:
        `${ROMAN_NUMERALS[grade]} (${NUMBER_WORDS[grade]}) ${program}`.trim(),
      age_label: entryAge
        ? `${entryAge.years} Tahun ${entryAge.months} Bulan (${ageNote})`
        : "",
    },
    payment: toLetterPayment(settings),
    signers: {
      principal_name: settings.principal_name,
      committee_chair_name: settings.committee_chair_name,
    },
    contacts: settings.letter_contacts,
  };
  return draft;
}

function toLetterPayment(
  settings: AdmissionSettingsRow,
): DecisionLetterContent["payment"] {
  const payment: DecisionLetterContent["payment"] = {
    deadline: settings.payment_deadline ?? "",
    bank_name: settings.bank_name,
    bank_account_number: settings.bank_account_number,
    bank_account_name: settings.bank_account_name,
  };
  return payment;
}

function toEntryYear(registration: PpdbRegistrationFullRow): string {
  const entryYear = (registration.academic_year ?? "").split("/")[0];
  return entryYear;
}
