"use server";

import { requirePermission } from "@/lib/auth/session";
import type { AdmissionSettingsResponse } from "@/modules/admission-settings/dto";
import * as admissionSettingsService from "@/modules/admission-settings/service";

export async function getAdmissionSettings(): Promise<AdmissionSettingsResponse | null> {
  const user = await requirePermission("manage_pmb_settings");
  if (!user) return null;

  try {
    return await admissionSettingsService.getSettingsView();
  } catch (error) {
    console.error(
      "lib/actions/admissionSettings.getAdmissionSettings failed:",
      error,
    );
    return null;
  }
}
