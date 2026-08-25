import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Email tidak valid."),
  password: z.string().min(1, "Password wajib diisi."),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export type SessionUser = {
  id: string;
  email: string;
  role: "superadmin" | "admin";
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  user: SessionUser;
};

export type AdminRole = "superadmin" | "admin";
export type AdminStatus = "invited" | "active" | "deactivated";

export const InviteAdminRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Email tidak valid."),
});

export type InviteAdminRequest = z.infer<typeof InviteAdminRequestSchema>;

export const UpdateAdminRequestSchema = z
  .object({
    role: z.enum(["admin", "superadmin"]).optional(),
    status: z.enum(["active", "deactivated"]).optional(),
  })
  .refine((data) => data.role !== undefined || data.status !== undefined, {
    message: "Tidak ada perubahan yang dikirim.",
  });

export type UpdateAdminRequest = z.infer<typeof UpdateAdminRequestSchema>;

export type DeleteAdminInput = {
  actingUserId: string;
  targetId: string;
};

export type UpdateAdminInput = DeleteAdminInput & {
  patch: UpdateAdminRequest;
};

export const ForgotPasswordRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Email tidak valid."),
});

export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const AcceptInviteRequestSchema = z.object({
  token: z.string().min(1, "Token tidak valid."),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

export type AcceptInviteRequest = z.infer<typeof AcceptInviteRequestSchema>;

export const ResetPasswordRequestSchema = AcceptInviteRequestSchema;

export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export type AdminResponse = {
  id: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
};

export type AdminMutationResult =
  | { ok: true; admin: AdminResponse }
  | {
      ok: false;
      reason: "self" | "last_superadmin" | "not_found";
      message: string;
    };

export type InviteAdminResult =
  | { ok: true; admin: AdminResponse }
  | { ok: false; reason: "already_exists"; message: string };

export type CredentialFlowResult =
  | { ok: true; tokens: TokenPair }
  | { ok: false; reason: "invalid_token" | "expired"; message: string };
