import type {
  RegistrationPaymentSummaries,
  RegistrationPaymentSummary,
} from "@/modules/payment/entity";
import type { MarkPaidInput } from "@/modules/payment/dto";
import * as paymentService from "@/modules/payment/service";
import * as registrationBiodataService from "@/modules/registration-biodata/service";
import * as registrationIntakeService from "@/modules/registration-intake/service";
import type {
  ListRegistrationsInput,
  PpdbRegistrationFullRow,
  PpdbRegistrationListItem,
  RegistrationFilter,
  ShortRegistrationIdentity,
  UpdateRegistrationFormInput,
  UpdateRegistrationInfoInput,
} from "@/modules/registration/entity";
import * as registrationService from "@/modules/registration/service";
import type {
  RecordManualResultInput,
  SaveScheduleInput,
  TestAssignmentResponse,
} from "@/modules/admission-test/dto";
import * as admissionTestService from "@/modules/admission-test/service";
import type {
  DecideInput,
  ProgressInput,
} from "@/modules/admission-decision/dto";
import * as admissionDecisionService from "@/modules/admission-decision/service";
import * as observationService from "@/modules/observation/service";
import type { SessionUser } from "@/modules/auth/dto";
import { withTransaction } from "@/modules/db/postgres";
import {
  RECEIVED_DOCUMENT_LABEL,
  RECEIVED_DOCUMENTS_BY_TYPE,
} from "@/modules/shared/constant/registration";
import { calculateEntryAge } from "@/modules/shared/entryAge";
import { buildRegistrationFullForm } from "@/modules/shared/registrationFullForm";
import type {
  EditRegistrationForm,
  ListRegistrationsQuery,
  RegistrationDetailResponse,
  RegistrationEditFormResponse,
  RegistrationListItemResponse,
  RegistrationListResponse,
  UpdateRegistrationFailureReason,
  UpdateRegistrationInput,
  UpdateRegistrationResult,
} from "./dto";
import type { RegistrationDetailParts } from "./entity";

export async function listRegistrations(
  query: ListRegistrationsQuery,
  actor: SessionUser,
): Promise<RegistrationListResponse> {
  const assignments =
    query.scope === "mine"
      ? await admissionTestService.listAssignments(actor.id)
      : null;
  const filter: RegistrationFilter = {
    search: query.search,
    statuses: query.statuses,
    academicYear: query.academic_year,
    program: query.program,
    registrationType: query.registration_type,
    registrationIds: assignments?.map((item) => item.registration_id) ?? null,
  };
  const listInput: ListRegistrationsInput = {
    ...filter,
    sortDirection: query.sort,
    limit: query.limit,
    offset: query.offset,
  };

  const [items, total, academicYears] = await Promise.all([
    registrationService.listItems(listInput),
    registrationService.countItems(filter),
    registrationService.listAcademicYears(),
  ]);
  const registrationIds = items.map((item) => item.id);
  const payments =
    await paymentService.getSummariesByRegistrationIds(registrationIds);

  const response: RegistrationListResponse = {
    items: items.map((item) => toListItem(item, payments, assignments)),
    total,
    has_more: query.offset + items.length < total,
    academic_years: academicYears,
  };
  return response;
}

export async function getRegistrationDetail(
  id: string,
  actor: SessionUser,
): Promise<RegistrationDetailResponse | null> {
  const row = await registrationService.findFullById(id);
  if (!row) return null;

  const registrationIds = [id];
  const hasFullForm = row.full_form_completed_at !== null;
  const [
    payments,
    parents,
    form,
    extras,
    scheduleView,
    paymentView,
    observation,
  ] = await Promise.all([
    paymentService.getSummariesByRegistrationIds(registrationIds),
    registrationBiodataService.listParentsByRegistrationIds(registrationIds),
    hasFullForm ? registrationService.findFormById(id) : null,
    hasFullForm
      ? registrationBiodataService.getDetailsAndAchievements(id)
      : null,
    admissionTestService.getScheduleView(id, actor),
    paymentService.getPaymentView(id, actor),
    row.registration_type === "siswa_baru"
      ? observationService.getSummary(id)
      : null,
  ]);

  const progressInput: ProgressInput = {
    status: row.status,
    registrationType: row.registration_type,
    schedule: scheduleView.schedule,
    observationState: observation?.state ?? null,
    actor,
  };
  const payment = toPaymentSummary(id, payments);
  const fullForm =
    form && extras
      ? buildRegistrationFullForm(row, form, parents, extras, payment)
      : null;

  const parts: RegistrationDetailParts = {
    fullForm,
    scheduleView,
    paymentView,
    observation,
    progress: admissionDecisionService.getProgress(progressInput),
  };
  const detail = toDetail(row, payments, parts);
  return detail;
}

export async function getRegistrationForm(
  id: string,
): Promise<RegistrationEditFormResponse | null> {
  const [form, biodata] = await Promise.all([
    registrationService.findFormById(id),
    registrationBiodataService.getFormBiodata(id),
  ]);
  if (!form) return null;

  const response: RegistrationEditFormResponse = {
    id: form.id,
    registration_number: form.registration_number,
    registration_type: form.registration_type,
    registration: {
      program: form.program,
      target_grade: form.target_grade,
      academic_year: form.academic_year,
      contact_name: form.contact_name,
      contact_phone: form.contact_phone,
    },
    values: {
      student: form.student,
      parent_email: form.parent_email,
      ...biodata,
    },
  };
  return response;
}

export async function updateRegistration(
  input: UpdateRegistrationInput,
): Promise<UpdateRegistrationResult> {
  try {
    const failureReason = await applyRegistrationUpdate(input);
    const registration = failureReason
      ? null
      : await getRegistrationDetail(input.id, input.actor);

    if (!registration) {
      const failure: UpdateRegistrationResult = {
        ok: false,
        reason: failureReason ?? "not_found",
      };
      return failure;
    }

    const result: UpdateRegistrationResult = { ok: true, registration };
    return result;
  } catch (error) {
    console.error(
      `registrationAdmin.updateRegistration failed for ${input.id}:`,
      error,
    );
    throw error;
  }
}

async function applyRegistrationUpdate(
  input: UpdateRegistrationInput,
): Promise<UpdateRegistrationFailureReason | null> {
  const { id, request } = input;

  if (request.action === "cancel") {
    const cancelled = await registrationService.cancel(id);
    return cancelled ? null : "invalid_state";
  }

  if (request.action === "reactivate") {
    const reactivated = await registrationService.reactivate(id);
    return reactivated ? null : "invalid_state";
  }

  if (request.action === "update_form") {
    return updateRegistrationForm(id, request.form);
  }

  if (request.action === "mark_paid") {
    const markInput: MarkPaidInput = {
      registrationId: id,
      request: request.payment,
      actor: input.actor,
    };
    return paymentService.markPaid(markInput);
  }

  if (request.action === "cancel_payment") {
    return paymentService.cancelPayment(id, input.actor);
  }

  if (request.action === "save_manual_result") {
    const resultInput: RecordManualResultInput = {
      registrationId: id,
      request: request.result,
      actor: input.actor,
    };
    return admissionTestService.recordManualResult(resultInput);
  }

  if (request.action === "decide") {
    const decideInput: DecideInput = {
      registrationId: id,
      result: request.result,
      actor: input.actor,
    };
    return admissionDecisionService.decide(decideInput);
  }

  if (request.action === "mark_reminded") {
    const marked = await admissionTestService.markReminded(id, input.actor.id);
    return marked ? null : "not_found";
  }

  const registration = await registrationService.findFullById(id);
  if (!registration) return "not_found";

  if (request.action === "schedule") {
    if (registration.status === "cancelled") return "invalid_state";
    const scheduleInput: SaveScheduleInput = {
      registrationId: id,
      request: request.schedule,
      actor: input.actor,
    };
    return admissionTestService.saveSchedule(scheduleInput);
  }

  const document = request.document;
  const allowedDocuments =
    RECEIVED_DOCUMENTS_BY_TYPE[registration.registration_type];
  if (!allowedDocuments.includes(document)) return "invalid_document";

  const received = registration.received_documents;
  const nextDocuments = received.includes(document)
    ? received.filter((code) => code !== document)
    : [...received, document];
  await registrationService.setReceivedDocuments(id, nextDocuments);
  return null;
}

async function updateRegistrationForm(
  id: string,
  form: EditRegistrationForm,
): Promise<UpdateRegistrationFailureReason | null> {
  const registration = await registrationService.findFullById(id);
  if (!registration) return "not_found";

  const next = form.registration;
  const isYearChanged = next.academic_year !== registration.academic_year;
  const nik = form.student.nik;
  const identity: ShortRegistrationIdentity = {
    fullName: form.student.full_name,
    dateOfBirth: form.student.date_of_birth,
    academicYear: next.academic_year,
  };
  const unchangedYears: string[] = [];
  const [academicYears, isDuplicate, isDuplicateNik] = await Promise.all([
    isYearChanged
      ? registrationIntakeService.listTargetAcademicYears()
      : unchangedYears,
    isYearChanged ? registrationService.existsShortDuplicate(identity) : false,
    nik ? registrationService.existsNikOnOther(nik, id) : false,
  ]);
  if (isYearChanged && !academicYears.includes(next.academic_year)) {
    return "invalid_year";
  }
  if (isDuplicate) return "manual_duplicate";
  if (isDuplicateNik) return "duplicate_nik";

  const allowedDocuments = RECEIVED_DOCUMENTS_BY_TYPE[next.registration_type];
  const formInput: UpdateRegistrationFormInput = {
    registrationId: id,
    parentEmail: form.parent_email,
    student: {
      ...form.student,
      phone: form.student.phone ?? next.contact_phone,
    },
  };
  await withTransaction(async (tx) => {
    const registrationNumber = isYearChanged
      ? await registrationIntakeService.assignRegistrationNumberWithin(
          tx,
          next.academic_year,
        )
      : registration.registration_number;
    const info: UpdateRegistrationInfoInput = {
      registrationId: id,
      registrationType: next.registration_type,
      academicYear: next.academic_year,
      registrationNumber,
      program: next.program,
      targetGrade: next.target_grade,
      contactName: next.contact_name,
      contactPhone: next.contact_phone,
      receivedDocuments: registration.received_documents.filter((code) =>
        allowedDocuments.includes(code),
      ),
    };
    await registrationService.updateInfoWithin(tx, info);
    await registrationService.updateFormWithin(tx, formInput);
    await registrationBiodataService.replaceWithin(tx, id, form);
  });
  return null;
}

function toPaymentSummary(
  registrationId: string,
  payments: RegistrationPaymentSummaries,
): RegistrationPaymentSummary {
  const summary = payments.get(registrationId);
  const paymentSummary: RegistrationPaymentSummary = {
    payment_status: summary?.payment_status ?? null,
    payment_amount: summary?.payment_amount ?? null,
    paid_at: summary?.paid_at ?? null,
    invoice_number: summary?.invoice_number ?? null,
  };
  return paymentSummary;
}

function toListItem(
  item: PpdbRegistrationListItem,
  payments: RegistrationPaymentSummaries,
  assignments: TestAssignmentResponse[] | null = null,
): RegistrationListItemResponse {
  const payment = payments.get(item.id);
  const response: RegistrationListItemResponse = {
    id: item.id,
    registration_number: item.registration_number,
    registration_type: item.registration_type,
    program: item.program,
    target_grade: item.target_grade,
    academic_year: item.academic_year,
    status: item.status,
    contact_name: item.contact_name,
    contact_phone: item.contact_phone,
    created_at: item.created_at,
    full_name: item.full_name,
    has_full_form: item.full_form_completed_at !== null,
    is_paid: payment?.payment_status === "success",
    received_document_count: item.received_documents.length,
    required_document_count:
      RECEIVED_DOCUMENTS_BY_TYPE[item.registration_type].length,
    assignment:
      assignments?.find((entry) => entry.registration_id === item.id) ?? null,
  };
  return response;
}

function toDetail(
  row: PpdbRegistrationFullRow,
  payments: RegistrationPaymentSummaries,
  parts: RegistrationDetailParts,
): RegistrationDetailResponse {
  const entryAge = row.academic_year
    ? calculateEntryAge(row.date_of_birth, row.academic_year)
    : null;

  const detail: RegistrationDetailResponse = {
    ...toListItem(row, payments),
    date_of_birth: row.date_of_birth,
    previous_school: row.previous_school,
    entry_age_label: entryAge
      ? `${entryAge.years} th ${entryAge.months} bln`
      : null,
    documents: RECEIVED_DOCUMENTS_BY_TYPE[row.registration_type].map(
      (code) => ({
        code,
        label: RECEIVED_DOCUMENT_LABEL[code],
        received: row.received_documents.includes(code),
      }),
    ),
    can_cancel: row.status !== "cancelled",
    can_reactivate: row.status === "cancelled",
    can_send_form_link: row.source === "online" && Boolean(row.contact_phone),
    full_form: parts.fullForm,
    schedule: parts.scheduleView.schedule,
    schedule_options: parts.scheduleView.options,
    payment: parts.paymentView,
    observation: parts.observation,
    ...parts.progress,
  };
  return detail;
}
