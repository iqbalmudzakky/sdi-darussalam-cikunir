"use server";

import * as registrationService from "@/modules/registration/service";
import type { Registration } from "@/types/Registration";

export async function listRegistrations(): Promise<Registration[]> {
  try {
    return await registrationService.listRegistrations();
  } catch (error) {
    console.error("lib/actions/registrations.listRegistrations failed:", error);
    return [];
  }
}
