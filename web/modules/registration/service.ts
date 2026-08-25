import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import {
  RATE_LIMIT_MAX_PER_HOUR,
  RATE_LIMIT_WINDOW_MINUTES,
  DUPLICATE_WINDOW_HOURS,
} from "@/modules/shared/constant/registration";
import type { PpdbRegistration, PpdbRegistrationStatus } from "./entity";
import type { CreatePpdbRegistrationRequest, CreatePpdbRegistrationResult } from "./dto";

export async function createRegistration(input: CreatePpdbRegistrationRequest): Promise<CreatePpdbRegistrationResult> {
  const recentCount = await withDbLogging("registration.countByIpSince", () => repository.countByIpSince(input.ip_address, RATE_LIMIT_WINDOW_MINUTES));

  if (recentCount >= RATE_LIMIT_MAX_PER_HOUR) {
    return {
      ok: false,
      reason: "rate_limited",
      message: "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
    };
  }

  const isDuplicate = await withDbLogging("registration.existsRecentDuplicate", () => repository.existsRecentDuplicate(input.student.full_name, input.student.date_of_birth, DUPLICATE_WINDOW_HOURS));

  if (isDuplicate) {
    return {
      ok: false,
      reason: "duplicate",
      message: "Anda sudah mengirim pendaftaran ini. Mohon tunggu, tim kami akan segera menghubungi.",
    };
  }

  const registrationId = await withDbLogging("registration.insert", () => repository.insert(input));

  return {
    ok: true,
    registration_id: registrationId,
  };
}

export async function listRegistrations() {
  return withDbLogging("registration.list", () => repository.list());
}

export async function deleteRegistration(id: string): Promise<void> {
  await withDbLogging("registration.remove", () => repository.remove(id));
}

export async function updateRegistrationStatus(id: string, status: PpdbRegistrationStatus): Promise<PpdbRegistration> {
  return withDbLogging("registration.updateStatus", () => repository.updateStatus(id, status));
}

export async function countPendingFollowUp(): Promise<number> {
  return withDbLogging("registration.countByStatus", () => repository.countByStatus("pending"));
}

export async function exportRegistrations() {
  return withDbLogging("registration.export", () => repository.exportList());
}
