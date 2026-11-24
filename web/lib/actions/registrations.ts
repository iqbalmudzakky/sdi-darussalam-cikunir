"use server";

import * as registrationAdminService from "@/modules/registration-admin/service";
import { requireUser } from "@/lib/auth/session";
import type {
  ListRegistrationsQuery,
  RegistrationEditFormResponse,
  RegistrationListResponse,
} from "@/modules/registration-admin/dto";
import type { ObservationViewResponse } from "@/modules/observation/dto";
import * as observationService from "@/modules/observation/service";
import type { TestReminderGroupResponse } from "@/modules/admission-test/dto";
import * as admissionTestService from "@/modules/admission-test/service";
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

export async function getRegistrationForm(
  id: string,
): Promise<RegistrationEditFormResponse | null> {
  const user = await requireUser();
  if (!user) return null;

  try {
    return await registrationAdminService.getRegistrationForm(id);
  } catch (error) {
    console.error(
      "lib/actions/registrations.getRegistrationForm failed:",
      error,
    );
    return null;
  }
}

export async function getObservation(
  id: string,
): Promise<ObservationViewResponse | null> {
  const user = await requireUser();
  if (!user) return null;

  try {
    return await observationService.getObservationView(id, user);
  } catch (error) {
    console.error("lib/actions/registrations.getObservation failed:", error);
    return null;
  }
}

export async function listTestReminders(): Promise<
  TestReminderGroupResponse[]
> {
  const user = await requireUser();
  if (!user) return [];

  try {
    return await admissionTestService.listReminders();
  } catch (error) {
    console.error("lib/actions/registrations.listTestReminders failed:", error);
    return [];
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
