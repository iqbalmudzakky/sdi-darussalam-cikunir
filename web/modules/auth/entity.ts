export type AdminStatus = "invited" | "active" | "deactivated";
export type AdminRole = "superadmin" | "admin";

export type AdminCredentials = {
  id: string;
  email: string;
  password_hash: string | null;
  role: AdminRole;
  status: AdminStatus;
};

export type AdminSummary = Omit<AdminCredentials, "password_hash"> & {
  created_at: string;
};

export type NewInvitedAdmin = {
  email: string;
};

export type AdminPatch = {
  role?: AdminRole;
  status?: AdminStatus;
};

export type RefreshToken = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
};

export type NewRefreshToken = Omit<RefreshToken, "id" | "created_at">;

export type AdminActionTokenPurpose = "invite" | "reset";

export type AdminActionToken = {
  id: string;
  user_id: string;
  purpose: AdminActionTokenPurpose;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export type NewAdminActionToken = Omit<
  AdminActionToken,
  "id" | "created_at" | "used_at"
>;

export type CountActionTokensInput = {
  userId: string;
  purpose: AdminActionTokenPurpose;
  windowMinutes: number;
};
