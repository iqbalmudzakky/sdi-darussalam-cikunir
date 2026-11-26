import type { AdminRole } from "@/modules/shared/constant/account/role";

export type { AdminRole };
export type AdminStatus = "invited" | "active" | "deactivated";

export type AdminItem = {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  is_self: boolean;
  can_manage: boolean;
  can_rename: boolean;
};

export type AdminListResponse = {
  admins: AdminItem[];
  role_options: AdminRole[];
  can_manage: boolean;
};

export type InviteAdminInput = {
  full_name: string;
  email: string;
  role: AdminRole;
};

export type UpdateAdminInput = {
  role?: AdminRole;
  status?: "active" | "deactivated";
  full_name?: string;
};
