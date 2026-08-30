"use server";

import * as registrationService from "@/modules/registration/service";
import type {
  ListRegistrationsQuery,
  RegistrantRegion,
  RegistrationListResponse,
} from "@/modules/registration/dto";

export async function listRegistrations(
  query: ListRegistrationsQuery,
): Promise<RegistrationListResponse> {
  try {
    return await registrationService.listRegistrations(query);
  } catch (error) {
    console.error("lib/actions/registrations.listRegistrations failed:", error);
    return { items: [], total: 0, has_more: false };
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
