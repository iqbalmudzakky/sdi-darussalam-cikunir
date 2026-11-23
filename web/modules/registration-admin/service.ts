import type ExcelJS from "exceljs";
import {
  buildRegistrationsWorkbookBuffer,
  getRegistrationsExportFilename,
} from "@/modules/export/registrationWorkbook";
import type {
  RegistrationPaymentSummaries,
  RegistrationPaymentSummary,
} from "@/modules/payment/entity";
import * as paymentService from "@/modules/payment/service";
import type { RegistrationParentRow } from "@/modules/registration-biodata/entity";
import * as registrationBiodataService from "@/modules/registration-biodata/service";
import type {
  ListRegistrationsInput,
  PpdbRegistrationFullRow,
  PpdbRegistrationListItem,
  RegistrationFilter,
} from "@/modules/registration/entity";
import * as registrationService from "@/modules/registration/service";
import {
  RECEIVED_DOCUMENT_LABEL,
  RECEIVED_DOCUMENTS_BY_TYPE,
} from "@/modules/shared/constant/registration";
import { calculateEntryAge } from "@/modules/shared/entryAge";
import { buildRegistrationFullForm } from "@/modules/shared/registrationFullForm";
import type {
  ExportRegistrationsQuery,
  ListRegistrationsQuery,
  RegistrationDetailResponse,
  RegistrationExportItem,
  RegistrationFullFormResponse,
  RegistrationParentColumns,
  RegistrationListItemResponse,
  RegistrationListResponse,
  UpdateRegistrationFailureReason,
  UpdateRegistrationInput,
  UpdateRegistrationResult,
} from "./dto";

export async function listRegistrations(
  query: ListRegistrationsQuery,
): Promise<RegistrationListResponse> {
  const filter: RegistrationFilter = {
    search: query.search,
    statuses: query.statuses,
    academicYear: query.academic_year,
    program: query.program,
    registrationType: query.registration_type,
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
    items: items.map((item) => toListItem(item, payments)),
    total,
    has_more: query.offset + items.length < total,
    academic_years: academicYears,
  };
  return response;
}

export async function getRegistrationDetail(
  id: string,
): Promise<RegistrationDetailResponse | null> {
  const row = await registrationService.findFullById(id);
  if (!row) return null;

  const registrationIds = [id];
  const hasFullForm = row.full_form_completed_at !== null;
  const [payments, parents, form, extras] = await Promise.all([
    paymentService.getSummariesByRegistrationIds(registrationIds),
    registrationBiodataService.listParentsByRegistrationIds(registrationIds),
    hasFullForm ? registrationService.findFormById(id) : null,
    hasFullForm
      ? registrationBiodataService.getDetailsAndAchievements(id)
      : null,
  ]);

  const payment = toPaymentSummary(id, payments);
  const fullForm =
    form && extras
      ? buildRegistrationFullForm(row, form, parents, extras, payment)
      : null;
  const detail = toDetail(row, payments, fullForm);
  return detail;
}

export async function updateRegistration(
  input: UpdateRegistrationInput,
): Promise<UpdateRegistrationResult> {
  try {
    const failureReason = await applyRegistrationUpdate(input);
    const registration = failureReason
      ? null
      : await getRegistrationDetail(input.id);

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

export async function exportRegistrations(
  query: ExportRegistrationsQuery,
): Promise<{
  buffer: ExcelJS.Buffer;
  filename: string;
}> {
  try {
    const rows = await registrationService.exportRows(query.statuses);
    const registrationIds = rows.map((row) => row.id);
    const [payments, parents] = await Promise.all([
      paymentService.getSummariesByRegistrationIds(registrationIds),
      registrationBiodataService.listParentsByRegistrationIds(registrationIds),
    ]);

    const registrations: RegistrationExportItem[] = rows.map((row) => ({
      ...row,
      ...toParentColumns(row.id, parents),
      ...toPaymentSummary(row.id, payments),
    }));
    const buffer = await buildRegistrationsWorkbookBuffer(registrations);
    const filename = getRegistrationsExportFilename();
    const workbook = { buffer, filename };
    return workbook;
  } catch (error) {
    console.error("registrationAdmin.exportRegistrations failed:", error);
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

  const registration = await registrationService.findFullById(id);
  if (!registration) return "not_found";

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
  };
  return response;
}

function toDetail(
  row: PpdbRegistrationFullRow,
  payments: RegistrationPaymentSummaries,
  fullForm: RegistrationFullFormResponse | null,
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
    full_form: fullForm,
  };
  return detail;
}

function toParentColumns(
  registrationId: string,
  parents: RegistrationParentRow[],
): RegistrationParentColumns {
  const ownParents = parents.filter(
    (parent) => parent.registration_id === registrationId,
  );
  const father = ownParents.find((parent) => parent.parent_type === "father");
  const mother = ownParents.find((parent) => parent.parent_type === "mother");

  const columns: RegistrationParentColumns = {
    father_status: toRelationshipStatus(father),
    father_name: father?.name ?? null,
    father_nik: father?.nik ?? null,
    father_place_of_birth: father?.place_of_birth ?? null,
    father_date_of_birth: father?.date_of_birth ?? null,
    father_phone: father?.phone ?? null,
    father_income: father?.income ?? null,
    mother_status: toRelationshipStatus(mother),
    mother_name: mother?.name ?? null,
    mother_nik: mother?.nik ?? null,
    mother_place_of_birth: mother?.place_of_birth ?? null,
    mother_date_of_birth: mother?.date_of_birth ?? null,
    mother_phone: mother?.phone ?? null,
    mother_income: mother?.income ?? null,
  };
  return columns;
}

function toRelationshipStatus(
  parent?: RegistrationParentRow,
): RegistrationParentColumns["father_status"] {
  const status = parent?.relationship_status ?? null;
  return status as RegistrationParentColumns["father_status"];
}
