export type AdminUser = {
  id: string;
  email: string;
  password_hash: string;
  role: "superadmin" | "admin";
  created_at: string;
  updated_at: string;
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
