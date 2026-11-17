"use server";

import * as adminService from "@/modules/admin/service";
import type { ActionTokenStatus } from "@/modules/admin/dto";

export async function getLinkStatus(
  token: string,
  purpose: "invite" | "reset",
): Promise<ActionTokenStatus> {
  try {
    const status = await adminService.getActionTokenStatus(token, purpose);
    return status;
  } catch (error) {
    console.error("getLinkStatus failed:", error);
    return "valid";
  }
}
