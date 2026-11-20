"use server";

import * as facilityService from "@/modules/facility/service";
import type { FacilityItem } from "@/types/content/Facility";

export async function listFacilities(): Promise<FacilityItem[]> {
  try {
    return await facilityService.listFacilities();
  } catch (error) {
    console.error("lib/actions/facilities.listFacilities failed:", error);
    return [];
  }
}
