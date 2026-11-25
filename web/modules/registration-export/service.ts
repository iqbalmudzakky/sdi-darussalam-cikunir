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
import * as registrationService from "@/modules/registration/service";
import type {
  ExportRegistrationsQuery,
  RegistrationExportItem,
  RegistrationParentColumns,
} from "./dto";

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
    console.error("registrationExport.exportRegistrations failed:", error);
    throw error;
  }
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
