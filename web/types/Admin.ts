import type { AdminRole } from "@/modules/shared/constant/role";

export type { AdminRole };
export type AdminStatus = "invited" | "active" | "deactivated";

export type AdminItem = {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  is_self: boolean;
  can_manage: boolean;
};

export type InviteAdminInput = {
  email: string;
  role: AdminRole;
};

export type UpdateAdminInput = {
  role?: AdminRole;
  status?: "active" | "deactivated";
};
