import { z } from "zod";
import type { SessionUser, TokenPair } from "@/modules/auth/dto";
import type { AdminSummary } from "@/modules/auth/entity";
import type { AdminActionToken } from "./entity";
import { ADMIN_ROLES, type AdminRole } from "@/modules/shared/constant/account/role";

export type AdminStatus = "invited" | "active" | "deactivated";

const FullNameSchema = z
  .string()
  .trim()
  .min(1, "Nama wajib diisi.")
  .max(120, "Nama maksimal 120 karakter.");

export const InviteAdminRequestSchema = z.object({
  full_name: FullNameSchema,
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
    full_name: FullNameSchema.optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
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
  full_name: string;
  role: AdminRole;
  status: AdminStatus;
  created_at: string;
  is_self: boolean;
  can_manage: boolean;
  can_rename: boolean;
};

export type AdminListResponse = {
  admins: AdminResponse[];
  role_options: AdminRole[];
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

export type ActionTokenStatus = "valid" | "invalid_token" | "expired";

export type CheckedActionToken =
  | { status: "valid"; actionToken: AdminActionToken; admin: AdminSummary }
  | { status: "invalid_token" | "expired" };

export type CredentialFlowResult =
  | { ok: true; tokens: TokenPair }
  | { ok: false; reason: "invalid_token" | "expired"; message: string };
