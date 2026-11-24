import type { TransactionSql } from "postgres";
import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import type { ReceivedDocument } from "@/modules/shared/constant/registration";
import type {
  AdvanceStatusInput,
  InsertFullRegistrationInput,
  ListRegistrationsInput,
  NewShortRegistration,
  PpdbRegistrationExportRow,
  PpdbRegistrationFormRow,
  PpdbRegistrationFullRow,
  PpdbRegistrationListItem,
  PpdbRegistrationStatus,
  RegistrationFilter,
  RegistrationSourceCounts,
  ShortRegistrationIdentity,
  UpdateRegistrationInfoInput,
  UpdateRegistrationFormInput,
} from "./entity";
import type { CreatePpdbRegistrationRequest, RegistrantRegion } from "./dto";

export async function insertWithin(
  tx: TransactionSql,
  input: CreatePpdbRegistrationRequest,
  options: InsertFullRegistrationInput,
): Promise<string> {
  return withDbLogging("registration.insertWithin", () =>
    repository.insertWithin(tx, input, options),
  );
}

export async function nextRegistrationNumberWithin(
  tx: TransactionSql,
  academicYear: string,
): Promise<string> {
  const sequence = await withDbLogging(
    "registration.nextRegistrationSequenceWithin",
    () => repository.nextRegistrationSequenceWithin(tx, academicYear),
  );
  const [startYear, endYear] = academicYear.split("/");
  const prefix = `${startYear.slice(2)}${endYear.slice(2)}`;
  const paddedSequence = String(sequence).padStart(3, "0");
  return `${prefix}-${paddedSequence}`;
}

export async function insertShortWithin(
  tx: TransactionSql,
  registration: NewShortRegistration,
): Promise<string> {
  return withDbLogging("registration.insertShortWithin", () =>
    repository.insertShortWithin(tx, registration),
  );
}

export async function existsShortDuplicate(
  identity: ShortRegistrationIdentity,
): Promise<boolean> {
  return withDbLogging("registration.existsShortDuplicate", () =>
    repository.existsShortDuplicate(identity),
  );
}

export async function countShortFormsByIpLastHour(
  ipAddress: string,
): Promise<number> {
  return withDbLogging("registration.countShortFormsByIpLastHour", () =>
    repository.countShortFormsByIpLastHour(ipAddress),
  );
}

export async function findFormById(
  id: string,
): Promise<PpdbRegistrationFormRow | null> {
  return withDbLogging("registration.findFormById", () =>
    repository.findFormById(id),
  );
}

export async function existsNikOnOther(
  nik: string,
  registrationId: string,
): Promise<boolean> {
  return withDbLogging("registration.existsNikOnOther", () =>
    repository.existsNikOnOther(nik, registrationId),
  );
}

export async function updateFormWithin(
  tx: TransactionSql,
  input: UpdateRegistrationFormInput,
): Promise<void> {
  await withDbLogging("registration.updateFormWithin", () =>
    repository.updateFormWithin(tx, input),
  );
}

export async function updateInfoWithin(
  tx: TransactionSql,
  input: UpdateRegistrationInfoInput,
): Promise<void> {
  await withDbLogging("registration.updateInfoWithin", () =>
    repository.updateInfoWithin(tx, input),
  );
}

export async function getSourceCounts(
  academicYear: string,
): Promise<RegistrationSourceCounts> {
  const countsByYear = await getSourceCountsForAllYears();
  const counts = countsByYear.get(academicYear) ?? {
    online: 0,
    offline_recorded: 0,
  };
  return counts;
}

export async function getSourceCountsForAllYears(): Promise<
  Map<string, RegistrationSourceCounts>
> {
  return withDbLogging("registration.countBySourceForAllYears", () =>
    repository.countBySourceForAllYears(),
  );
}

export async function listItems(
  input: ListRegistrationsInput,
): Promise<PpdbRegistrationListItem[]> {
  return withDbLogging("registration.list", () => repository.list(input));
}

export async function countItems(filter: RegistrationFilter): Promise<number> {
  return withDbLogging("registration.count", () => repository.count(filter));
}

export async function listAcademicYears(): Promise<string[]> {
  return withDbLogging("registration.listAcademicYears", () =>
    repository.listAcademicYears(),
  );
}

export async function findFullById(
  id: string,
): Promise<PpdbRegistrationFullRow | null> {
  const rows = await listFullByIds([id]);
  return rows[0] ?? null;
}

export async function listFullByIds(
  ids: string[],
): Promise<PpdbRegistrationFullRow[]> {
  if (ids.length === 0) return [];

  return withDbLogging("registration.listFullByIds", () =>
    repository.listFullByIds(ids),
  );
}

export async function advanceStatusWithin(
  tx: TransactionSql,
  input: AdvanceStatusInput,
): Promise<void> {
  await withDbLogging("registration.advanceStatusWithin", () =>
    repository.advanceStatusWithin(tx, input),
  );
}

export async function cancel(id: string): Promise<boolean> {
  return withDbLogging("registration.cancel", () => repository.cancel(id));
}

export async function reactivate(id: string): Promise<boolean> {
  return withDbLogging("registration.reactivate", () =>
    repository.reactivate(id),
  );
}

export async function setReceivedDocuments(
  id: string,
  documents: ReceivedDocument[],
): Promise<void> {
  await withDbLogging("registration.setReceivedDocuments", () =>
    repository.setReceivedDocuments(id, documents),
  );
}

export async function exportRows(
  statuses: PpdbRegistrationStatus[],
): Promise<PpdbRegistrationExportRow[]> {
  return withDbLogging("registration.export", () =>
    repository.exportList(statuses),
  );
}

export async function deleteRegistration(id: string): Promise<void> {
  await withDbLogging("registration.remove", () => repository.remove(id));
}

export async function existsDuplicateByNik(nik: string): Promise<boolean> {
  return withDbLogging("registration.existsDuplicateByNik", () =>
    repository.existsDuplicateByNik(nik),
  );
}

export async function countPendingFollowUp(): Promise<number> {
  return withDbLogging("registration.countByStatus", () =>
    repository.countByStatus("new"),
  );
}

export async function getRegistrantRegions(
  limit = 8,
): Promise<RegistrantRegion[]> {
  return withDbLogging("registration.listRegistrantRegions", () =>
    repository.listRegistrantRegions(limit),
  );
}
