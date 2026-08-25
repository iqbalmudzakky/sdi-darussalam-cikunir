"use server";

import * as registrationService from "@/modules/registration/service";
import type { RegistrationListItemResponse } from "@/modules/registration/dto";

export async function listRegistrations(): Promise<
  RegistrationListItemResponse[]
> {
  try {
    return await registrationService.listRegistrations();
  } catch (error) {
    console.error("lib/actions/registrations.listRegistrations failed:", error);
    return [];
  }
}
