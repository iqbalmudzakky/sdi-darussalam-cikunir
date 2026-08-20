"use server";

import * as schoolProfileService from "@/modules/school-profile/service";
import type { SchoolProfile } from "@/types/SchoolProfile";

const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  photo_url: null,
  description: "",
  visi: "",
  misi: [],
  alamat: "",
  telepon: "",
  whatsapp: "",
  whatsapp_message: "",
  email: "",
  jam_operasional: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
};

export async function getSchoolProfile(): Promise<SchoolProfile> {
  try {
    return await schoolProfileService.getSchoolProfile();
  } catch (error) {
    console.error("lib/actions/schoolProfile.getSchoolProfile failed:", error);
    return DEFAULT_SCHOOL_PROFILE;
  }
}
