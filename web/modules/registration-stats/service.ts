import { withDbLogging } from "@/modules/db/errors";
import type { TransactionSql } from "postgres";
import * as registrationService from "@/modules/registration/service";
import type { RegistrationSourceCounts } from "@/modules/registration/entity";
import * as repository from "./repository";
import type { AcademicYearSummaryResponse } from "./dto";
import type { RegistrationStats } from "./entity";

function toSummary(
  stats: RegistrationStats,
  counts: RegistrationSourceCounts,
): AcademicYearSummaryResponse {
  return {
    academic_year: stats.academic_year,
    is_current: stats.is_current,
    online_count: counts.online,
    offline_recorded_count: counts.offline_recorded,
    offline_pending_count: stats.offline_count,
    total: counts.online + counts.offline_recorded + stats.offline_count,
  };
}

export async function listAcademicYears(): Promise<
  AcademicYearSummaryResponse[]
> {
  const years = await withDbLogging("registrationStats.list", () =>
    repository.list(),
  );

  const countsByYear = await registrationService.getSourceCountsForAllYears();
  const emptyCounts: RegistrationSourceCounts = {
    online: 0,
    offline_recorded: 0,
  };

  return years.map((year) =>
    toSummary(year, countsByYear.get(year.academic_year) ?? emptyCounts),
  );
}

export async function getSummary(
  academicYear: string,
): Promise<AcademicYearSummaryResponse | null> {
  const stats = await withDbLogging("registrationStats.get", () =>
    repository.get(academicYear),
  );
  if (!stats) return null;

  const counts = await registrationService.getSourceCounts(academicYear);
  return toSummary(stats, counts);
}

export async function getCurrentSummary(): Promise<AcademicYearSummaryResponse | null> {
  const current = await withDbLogging("registrationStats.getCurrent", () =>
    repository.getCurrent(),
  );
  if (!current) return null;

  return getSummary(current.academic_year);
}

export async function addAcademicYear(
  academicYear: string,
): Promise<AcademicYearSummaryResponse> {
  const created = await withDbLogging("registrationStats.create", () =>
    repository.create(academicYear),
  );
  return toSummary(created, { online: 0, offline_recorded: 0 });
}

export async function saveOfflineCount(
  academicYear: string,
  offlineCount: number,
): Promise<AcademicYearSummaryResponse | null> {
  const updated = await withDbLogging("registrationStats.setOfflineCount", () =>
    repository.setOfflineCount(academicYear, offlineCount),
  );
  if (!updated) return null;

  const counts = await registrationService.getSourceCounts(academicYear);
  return toSummary(updated, counts);
}

export async function findCurrentAcademicYearWithin(
  tx: TransactionSql,
): Promise<string | null> {
  return withDbLogging("registrationStats.findCurrentAcademicYearWithin", () =>
    repository.findCurrentAcademicYearWithin(tx),
  );
}

export async function setCurrentAcademicYear(
  academicYear: string,
): Promise<AcademicYearSummaryResponse> {
  const updated = await withDbLogging("registrationStats.setCurrent", () =>
    repository.setCurrent(academicYear),
  );
  const counts = await registrationService.getSourceCounts(academicYear);
  return toSummary(updated, counts);
}
