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

export type NewLoginAttempt = {
  email: string;
  ip_address: string;
};

export type CountLoginAttemptsInput = {
  email: string;
  ipAddress: string;
  windowMinutes: number;
};

export type LoginAttemptCounts = {
  by_email: number;
  by_ip: number;
};
