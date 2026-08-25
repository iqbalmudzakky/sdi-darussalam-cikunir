"use server";

import * as registrationService from "@/modules/registration/service";

export type RegistrationListItem = {
  id: string;
  registration_type: "siswa_baru" | "pindahan";
  status: "pending" | "in_progress" | "not_registered" | "registered";
  ip_address: string | null;
  created_at: string;
  updated_at: string;

  full_name: string;
  nik: string;
  previous_school: string;

  father_name: string | null;
  mother_name: string | null;
};

export async function listRegistrations(): Promise<RegistrationListItem[]> {
  try {
    return await registrationService.listRegistrations();
  } catch (error) {
    console.error("lib/actions/registrations.listRegistrations failed:", error);

    return [];
  }
}
