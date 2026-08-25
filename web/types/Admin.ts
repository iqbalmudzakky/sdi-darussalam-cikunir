export type AdminRole = "superadmin" | "admin";
export type AdminStatus = "invited" | "active" | "deactivated";

export type AdminItem = {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
};

export type InviteAdminInput = {
  email: string;
};

export type UpdateAdminInput = {
  role?: AdminRole;
  status?: "active" | "deactivated";
};
