"use server";

import * as registrationAdminService from "@/modules/registration-admin/service";
import type {
  ListRegistrationsQuery,
  RegistrationListResponse,
} from "@/modules/registration-admin/dto";
import type { FullFormLinkResult } from "@/modules/registration-link/dto";
import * as registrationLinkService from "@/modules/registration-link/service";
import * as registrationService from "@/modules/registration/service";
import type { RegistrantRegion } from "@/modules/registration/dto";

export async function listRegistrations(
  query: ListRegistrationsQuery,
): Promise<RegistrationListResponse> {
  try {
    return await registrationAdminService.listRegistrations(query);
  } catch (error) {
    console.error("lib/actions/registrations.listRegistrations failed:", error);
    const emptyList: RegistrationListResponse = {
      items: [],
      total: 0,
      has_more: false,
      academic_years: [],
    };
    return emptyList;
  }
}

export async function countPendingRegistrations(): Promise<number> {
  try {
    return await registrationService.countPendingFollowUp();
  } catch (error) {
    console.error(
      "lib/actions/registrations.countPendingRegistrations failed:",
      error,
    );
    return 0;
  }
}

export async function getFullFormByToken(
  token: string,
): Promise<FullFormLinkResult> {
  try {
    return await registrationLinkService.getFullFormByToken(token);
  } catch (error) {
    console.error(
      "lib/actions/registrations.getFullFormByToken failed:",
      error,
    );
    const unavailable: FullFormLinkResult = {
      status: "expired",
      whatsapp_url: null,
    };
    return unavailable;
  }
}

export async function getRegistrantRegions(): Promise<RegistrantRegion[]> {
  try {
    return await registrationService.getRegistrantRegions();
  } catch (error) {
    console.error(
      "lib/actions/registrations.getRegistrantRegions failed:",
      error,
    );
    return [];
  }
}
