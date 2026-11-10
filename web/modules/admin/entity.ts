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
