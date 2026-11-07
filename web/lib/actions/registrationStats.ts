"use server";

import * as registrationStatsService from "@/modules/registration-stats/service";
import type { AcademicYearSummary } from "@/types/RegistrationStats";

export async function getCurrentSummary(): Promise<AcademicYearSummary | null> {
  try {
    return await registrationStatsService.getCurrentSummary();
  } catch (error) {
    console.error(
      "lib/actions/registrationStats.getCurrentSummary failed:",
      error,
    );
    return null;
  }
}
