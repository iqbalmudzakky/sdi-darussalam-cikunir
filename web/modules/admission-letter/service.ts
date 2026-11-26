import * as admissionDecisionService from "@/modules/admission-decision/service";
import * as admissionSettingsService from "@/modules/admission-settings/service";
import * as admissionTestService from "@/modules/admission-test/service";
import type { SessionUser } from "@/modules/auth/dto";
import { withDbLogging } from "@/modules/db/errors";
import type { RegistrationParentRow } from "@/modules/registration-biodata/entity";
import * as registrationBiodataService from "@/modules/registration-biodata/service";
import * as registrationService from "@/modules/registration/service";
import { NUMBER_WORDS } from "@/modules/shared/constant/admission/letter";
import { PARENT_OCCUPATION_LABEL } from "@/modules/shared/constant/admission/registrationForm";
import { jakartaDateKey } from "@/modules/shared/date/jakartaDate";
import { toLetterDate } from "@/modules/shared/date/letterDate";
import { formatRupiah } from "@/modules/shared/format/rupiah";
import * as repository from "./repository";
import type {
  SaveStatementRequestInput,
  SaveStatementResult,
  StatementFailureReason,
  StatementViewResponse,
} from "./dto";
import type {
  SaveStatementInput,
  StatementAddress,
  StatementContent,
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

  let content: StatementContent;
  if (request.action === "refresh_statement") {
    content = await buildDraft(registrationId);
  } else {
    const fees = row?.content.fees ?? (await buildDraft(registrationId)).fees;
    content = { ...request.statement, fees };
  }
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

async function buildDraft(registrationId: string): Promise<StatementContent> {
  const [form, parents, settings] = await Promise.all([
    registrationService.findFormById(registrationId),
    registrationBiodataService.listParentsByRegistrationIds([registrationId]),
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
    fees: {
      tahfizh_yearly_fee: settings.tahfizh_yearly_fee,
      tahfizh_july_fee: settings.tahfizh_july_fee,
      unggulan_yearly_fee: settings.unggulan_yearly_fee,
      unggulan_july_fee: settings.unggulan_july_fee,
      darussalam_discount: settings.darussalam_discount,
      other_discount: settings.other_discount,
      payment_deadline: settings.payment_deadline,
    },
    signers: {
      principal_name: settings.principal_name,
      director_name: settings.director_name,
    },
  };
  return draft;
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
