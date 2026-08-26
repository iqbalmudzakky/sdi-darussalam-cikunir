import type ExcelJS from "exceljs";
import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import {
  buildRegistrationsWorkbookBuffer,
  getRegistrationsExportFilename,
} from "@/modules/export/registrationWorkbook";
import {
  RATE_LIMIT_MAX_PER_HOUR,
  RATE_LIMIT_WINDOW_MINUTES,
  DUPLICATE_WINDOW_HOURS,
} from "@/modules/shared/constant/registration";
import type {
  PpdbRegistration,
  PpdbRegistrationListItem,
  PpdbRegistrationStatus,
} from "./entity";
import type {
  CreatePpdbRegistrationRequest,
  CreatePpdbRegistrationResult,
  RegistrationListItemResponse,
} from "./dto";

export async function createRegistration(
  input: CreatePpdbRegistrationRequest,
): Promise<CreatePpdbRegistrationResult> {
  const recentCount = await withDbLogging("registration.countByIpSince", () =>
    repository.countByIpSince(input.ip_address, RATE_LIMIT_WINDOW_MINUTES),
  );

  if (recentCount >= RATE_LIMIT_MAX_PER_HOUR) {
    return {
      ok: false,
      reason: "rate_limited",
      message: "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
    };
  }

  const isDuplicate = await withDbLogging(
    "registration.existsRecentDuplicate",
    () =>
      repository.existsRecentDuplicate(
        input.student.full_name,
        input.student.date_of_birth,
        DUPLICATE_WINDOW_HOURS,
      ),
  );

  if (isDuplicate) {
    return {
      ok: false,
      reason: "duplicate",
      message:
        "Anda sudah mengirim pendaftaran ini. Mohon tunggu, tim kami akan segera menghubungi.",
    };
  }

  const registrationId = await withDbLogging("registration.insert", () =>
    repository.insert(input),
  );

  return {
    ok: true,
    registration_id: registrationId,
  };
}

function toRegistrationListItemResponse(
  item: PpdbRegistrationListItem,
): RegistrationListItemResponse {
  return {
    id: item.id,
    registration_type: item.registration_type,
    status: item.status,
    ip_address: item.ip_address,
    parent_email: item.parent_email,
    created_at: item.created_at,

    full_name: item.full_name,
    student_nik: item.student_nik,
    gender: item.gender,
    place_of_birth: item.place_of_birth,
    date_of_birth: item.date_of_birth,
    birth_order: item.birth_order,
    sibling_count: item.sibling_count,
    current_address: item.current_address,
    physical_disability: item.physical_disability,
    previous_school: item.previous_school,
    nisn: item.nisn,

    father_status: item.father_status,
    father_name: item.father_name,
    father_nik: item.father_nik,
    father_place_of_birth: item.father_place_of_birth,
    father_date_of_birth: item.father_date_of_birth,
    father_phone: item.father_phone,
    father_income: item.father_income,

    mother_status: item.mother_status,
    mother_name: item.mother_name,
    mother_nik: item.mother_nik,
    mother_place_of_birth: item.mother_place_of_birth,
    mother_date_of_birth: item.mother_date_of_birth,
    mother_phone: item.mother_phone,
    mother_income: item.mother_income,

    payment_status: item.payment_status,
    payment_amount: item.payment_amount,
    paid_at: item.paid_at,
    invoice_number: item.invoice_number,
  };
}

export async function listRegistrations(): Promise<
  RegistrationListItemResponse[]
> {
  const items = await withDbLogging("registration.list", () =>
    repository.list(),
  );
  return items.map(toRegistrationListItemResponse);
}

export async function deleteRegistration(id: string): Promise<void> {
  await withDbLogging("registration.remove", () => repository.remove(id));
}

export async function updateRegistrationStatus(
  id: string,
  status: PpdbRegistrationStatus,
): Promise<PpdbRegistration> {
  return withDbLogging("registration.updateStatus", () =>
    repository.updateStatus(id, status),
  );
}

export async function countPendingFollowUp(): Promise<number> {
  return withDbLogging("registration.countByStatus", () =>
    repository.countByStatus("pending"),
  );
}

export async function exportRegistrations(): Promise<{
  buffer: ExcelJS.Buffer;
  filename: string;
}> {
  try {
    const registrations = await withDbLogging("registration.export", () =>
      repository.exportList(),
    );
    const buffer = await buildRegistrationsWorkbookBuffer(registrations);
    const filename = getRegistrationsExportFilename();
    return { buffer, filename };
  } catch (error) {
    console.error("registration.exportRegistrations failed:", error);
    throw error;
  }
}
