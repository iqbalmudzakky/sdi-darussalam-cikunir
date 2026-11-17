import { z } from "zod";
import type { SessionUser, TokenPair } from "@/modules/auth/dto";
import { ADMIN_ROLES, type AdminRole } from "@/modules/shared/constant/role";

export type AdminStatus = "invited" | "active" | "deactivated";

export const InviteAdminRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Email tidak valid."),
  role: z.enum(ADMIN_ROLES, "Peran wajib dipilih."),
});

export type InviteAdminRequest = z.infer<typeof InviteAdminRequestSchema>;

export const UpdateAdminRequestSchema = z
  .object({
    role: z.enum(ADMIN_ROLES).optional(),
    status: z.enum(["active", "deactivated"]).optional(),
  })
  .refine((data) => data.role !== undefined || data.status !== undefined, {
    message: "Tidak ada perubahan yang dikirim.",
  });

export type UpdateAdminRequest = z.infer<typeof UpdateAdminRequestSchema>;

export type InviteAdminInput = {
  actingUser: SessionUser;
  request: InviteAdminRequest;
};

export type AdminTargetInput = {
  actingUser: SessionUser;
  targetId: string;
};

export type UpdateAdminInput = AdminTargetInput & {
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
  is_self: boolean;
  can_manage: boolean;
};

export type AdminMutationFailure =
  "self" | "forbidden_role" | "last_manager" | "not_found";

export type AdminMutationResult =
  | { ok: true; admin: AdminResponse }
  | {
      ok: false;
      reason: AdminMutationFailure;
      message: string;
    };

export type InviteAdminResult =
  | { ok: true; admin: AdminResponse }
  | {
      ok: false;
      reason: "already_exists" | "forbidden_role";
      message: string;
    };

export type CredentialFlowResult =
  | { ok: true; tokens: TokenPair }
  | { ok: false; reason: "invalid_token" | "expired"; message: string };
