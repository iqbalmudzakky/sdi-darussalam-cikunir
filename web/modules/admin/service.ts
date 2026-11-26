import * as repository from "./repository";
import * as authService from "@/modules/auth/service";
import { withDbLogging } from "@/modules/db/errors";
import {
  generateRefreshToken,
  hashRefreshToken,
  INVITE_TOKEN_TTL_SECONDS,
  RESET_TOKEN_TTL_SECONDS,
} from "@/modules/crypto/tokens";
import { hashPassword } from "@/modules/crypto/hash";
import { sendInviteEmail, sendPasswordResetEmail } from "@/modules/email/email";
import { buildAdminUrl } from "@/modules/shared/web/siteUrl";
import {
  FORGOT_PASSWORD_RATE_LIMIT_MAX,
  FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MINUTES,
} from "@/modules/shared/constant/account/auth";
import {
  ADMIN_ROLES,
  LEADER_ROLES,
  ROLE_PERMISSIONS,
  type AdminRole,
} from "@/modules/shared/constant/account/role";
import type { AdminSummary } from "@/modules/auth/entity";
import type { SessionUser } from "@/modules/auth/dto";
import type {
  AdminActionTokenPurpose,
  CountActionTokensInput,
  NewAdminActionToken,
} from "./entity";
import type {
  AcceptInviteRequest,
  AdminListResponse,
  AdminMutationResult,
  AdminResponse,
  CredentialFlowResult,
  ActionTokenStatus,
  AdminTargetInput,
  CheckedActionToken,
  ForgotPasswordRequest,
  InviteAdminInput,
  InviteAdminResult,
  ResetPasswordRequest,
  UpdateAdminInput,
} from "./dto";

function toAdminResponse(
  admin: AdminSummary,
  actingUser: SessionUser,
): AdminResponse {
  const isSelf = admin.id === actingUser.id;
  const canManage =
    !isSelf && listAssignableRoles(actingUser.role).includes(admin.role);
  const response: AdminResponse = {
    id: admin.id,
    email: admin.email,
    full_name: admin.full_name,
    role: admin.role,
    status: admin.status,
    created_at: admin.created_at,
    is_self: isSelf,
    can_manage: canManage,
    can_rename: isSelf || canManage,
  };
  return response;
}

export function listAssignableRoles(actingRole: AdminRole): AdminRole[] {
  if (!ROLE_PERMISSIONS[actingRole].includes("manage_accounts")) return [];

  const permissions = ROLE_PERMISSIONS[actingRole];
  const canManageDeveloper = permissions.includes("manage_developer_accounts");
  const canAssignLeader = permissions.includes("assign_leader_roles");
  const roles = ADMIN_ROLES.filter(
    (role) =>
      (role !== "developer" || canManageDeveloper) &&
      (!LEADER_ROLES.includes(role) || canAssignLeader),
  );
  return roles;
}

export async function listAdmins(
  actingUser: SessionUser,
): Promise<AdminListResponse> {
  try {
    const admins = await authService.listAccounts();
    const response: AdminListResponse = {
      admins: admins
        .map((admin) => toAdminResponse(admin, actingUser))
        .sort((a, b) => Number(b.is_self) - Number(a.is_self)),
      role_options: listAssignableRoles(actingUser.role),
      can_manage: authService.hasPermission(actingUser.role, "manage_accounts"),
    };
    return response;
  } catch (error) {
    console.error("admin.listAdmins failed:", error);
    throw error;
  }
}

async function issueAndSendInviteToken(admin: AdminSummary): Promise<void> {
  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);
  const expiresAtMs = Date.now() + INVITE_TOKEN_TTL_SECONDS * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();

  const newActionToken: NewAdminActionToken = {
    user_id: admin.id,
    purpose: "invite",
    token_hash: tokenHash,
    expires_at: expiresAt,
  };
  await withDbLogging("admin.insertActionToken", () =>
    repository.insertActionToken(newActionToken),
  );

  const invitePath = `/invite/${rawToken}`;
  const inviteUrl = buildAdminUrl(invitePath);
  const inviteEmail = {
    to: admin.email,
    inviteUrl,
    role: admin.role,
    validHours: INVITE_TOKEN_TTL_SECONDS / 3600,
  };
  await sendInviteEmail(inviteEmail);
}

export async function inviteAdmin(
  input: InviteAdminInput,
): Promise<InviteAdminResult> {
  const { actingUser, request } = input;
  try {
    const assignableRoles = listAssignableRoles(actingUser.role);
    if (!assignableRoles.includes(request.role)) {
      return {
        ok: false,
        reason: "forbidden_role",
        message: "Anda tidak bisa memberi peran ini.",
      };
    }

    const existing = await authService.findAccountByEmail(request.email);
    if (existing) {
      return {
        ok: false,
        reason: "already_exists",
        message: "Email sudah terdaftar.",
      };
    }

    const newAdmin = {
      email: request.email,
      full_name: request.full_name,
      role: request.role,
    };
    const admin = await authService.createInvitedAccount(newAdmin);

    await issueAndSendInviteToken(admin);

    return { ok: true, admin: toAdminResponse(admin, actingUser) };
  } catch (error) {
    console.error(`admin.inviteAdmin failed for ${request.email}:`, error);
    throw error;
  }
}

export async function resendInvite(
  input: AdminTargetInput,
): Promise<InviteAdminResult> {
  const { actingUser, targetId } = input;
  try {
    const admin = await authService.findAccountById(targetId);
    if (!admin || admin.status !== "invited") {
      return {
        ok: false,
        reason: "already_exists",
        message: "Akun tidak ditemukan atau sudah aktif.",
      };
    }

    await withDbLogging("admin.invalidateActiveActionTokens", () =>
      repository.invalidateActiveActionTokens(admin.id, "invite"),
    );
    await issueAndSendInviteToken(admin);

    return { ok: true, admin: toAdminResponse(admin, actingUser) };
  } catch (error) {
    console.error(`admin.resendInvite failed for ${targetId}:`, error);
    throw error;
  }
}

async function completeTokenFlow(
  input: AcceptInviteRequest,
  purpose: "invite" | "reset",
): Promise<CredentialFlowResult> {
  const checked = await checkActionToken(input.token, purpose);
  if (checked.status !== "valid") {
    const message =
      checked.status === "expired"
        ? "Link expired."
        : "Link tidak valid atau sudah digunakan.";
    const failure: CredentialFlowResult = {
      ok: false,
      reason: checked.status,
      message,
    };
    return failure;
  }

  const { actionToken, admin } = checked;

  const passwordHash = await hashPassword(input.password);
  const updated =
    purpose === "invite"
      ? await authService.activateAccount(admin.id, passwordHash)
      : await authService.updateAccountPassword(admin.id, passwordHash);
  await withDbLogging("admin.markActionTokenUsed", () =>
    repository.markActionTokenUsed(actionToken.id),
  );
  await authService.revokeAllSessions(admin.id);

  const user: SessionUser = {
    id: updated.id,
    email: updated.email,
    role: updated.role,
  };
  const tokens = await authService.issueTokenPair(user);
  const result: CredentialFlowResult = { ok: true, tokens };
  return result;
}

export async function getActionTokenStatus(
  rawToken: string,
  purpose: AdminActionTokenPurpose,
): Promise<ActionTokenStatus> {
  try {
    const checked = await checkActionToken(rawToken, purpose);
    return checked.status;
  } catch (error) {
    console.error(`admin.getActionTokenStatus failed for ${purpose}:`, error);
    throw error;
  }
}

export async function acceptInvite(
  input: AcceptInviteRequest,
): Promise<CredentialFlowResult> {
  try {
    const result = await completeTokenFlow(input, "invite");
    return result;
  } catch (error) {
    console.error("admin.acceptInvite failed:", error);
    throw error;
  }
}

export async function resetPassword(
  input: ResetPasswordRequest,
): Promise<CredentialFlowResult> {
  try {
    const result = await completeTokenFlow(input, "reset");
    return result;
  } catch (error) {
    console.error("admin.resetPassword failed:", error);
    throw error;
  }
}

export async function forgotPassword(
  input: ForgotPasswordRequest,
): Promise<void> {
  try {
    const admin = await authService.findAccountByEmail(input.email);
    if (!admin || admin.status !== "active") return;

    const countInput: CountActionTokensInput = {
      userId: admin.id,
      purpose: "reset",
      windowMinutes: FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MINUTES,
    };
    const recentCount = await withDbLogging(
      "admin.countRecentActionTokens",
      () => repository.countRecentActionTokens(countInput),
    );
    if (recentCount >= FORGOT_PASSWORD_RATE_LIMIT_MAX) return;

    await withDbLogging("admin.invalidateActiveActionTokens", () =>
      repository.invalidateActiveActionTokens(admin.id, "reset"),
    );

    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresAtMs = Date.now() + RESET_TOKEN_TTL_SECONDS * 1000;
    const expiresAt = new Date(expiresAtMs).toISOString();

    const newActionToken: NewAdminActionToken = {
      user_id: admin.id,
      purpose: "reset",
      token_hash: tokenHash,
      expires_at: expiresAt,
    };
    await withDbLogging("admin.insertActionToken", () =>
      repository.insertActionToken(newActionToken),
    );

    const resetPath = `/reset-password/${rawToken}`;
    const resetUrl = buildAdminUrl(resetPath);
    const resetEmail = {
      to: admin.email,
      resetUrl,
      validHours: RESET_TOKEN_TTL_SECONDS / 3600,
    };
    await sendPasswordResetEmail(resetEmail);
  } catch (error) {
    console.error(`admin.forgotPassword failed for ${input.email}:`, error);
    throw error;
  }
}

export async function updateAdmin(
  input: UpdateAdminInput,
): Promise<AdminMutationResult> {
  const { actingUser, targetId, patch } = input;
  try {
    const isSelf = targetId === actingUser.id;
    const isRenameOnly = !patch.role && !patch.status;
    if (isSelf && !isRenameOnly) {
      return {
        ok: false,
        reason: "self",
        message: "Tidak bisa mengubah status atau peran akun sendiri.",
      };
    }

    const target = await authService.findAccountById(targetId);
    if (!target) {
      return {
        ok: false,
        reason: "not_found",
        message: "Akun tidak ditemukan.",
      };
    }
    if (isSelf) {
      const renamed = await authService.updateAccount(targetId, patch);
      return { ok: true, admin: toAdminResponse(renamed, actingUser) };
    }

    const assignableRoles = listAssignableRoles(actingUser.role);
    const allowedTarget = assignableRoles.includes(target.role);
    const allowedNextRole = !patch.role || assignableRoles.includes(patch.role);
    if (!allowedTarget || !allowedNextRole) {
      return {
        ok: false,
        reason: "forbidden_role",
        message: "Anda tidak bisa mengatur akun dengan peran ini.",
      };
    }

    const isActiveManager =
      target.status === "active" &&
      ROLE_PERMISSIONS[target.role].includes("assign_leader_roles");
    const nextRole = patch.role ?? target.role;
    const losesManagement =
      !ROLE_PERMISSIONS[nextRole].includes("assign_leader_roles") ||
      patch.status === "deactivated";
    const remainingManagers =
      isActiveManager && losesManagement
        ? await authService.countOtherActiveAccountManagers(targetId)
        : null;
    if (remainingManagers === 0) {
      return {
        ok: false,
        reason: "last_manager",
        message: "Tidak bisa mengubah kepsek atau admin aktif terakhir.",
      };
    }

    const updated = await authService.updateAccount(targetId, patch);
    if (patch.status === "deactivated") {
      await authService.revokeAllSessions(targetId);
    }
    return { ok: true, admin: toAdminResponse(updated, actingUser) };
  } catch (error) {
    console.error(`admin.updateAdmin failed for ${targetId}:`, error);
    throw error;
  }
}

export async function deleteAdmin(
  input: AdminTargetInput,
): Promise<AdminMutationResult> {
  const { actingUser, targetId } = input;
  try {
    if (targetId === actingUser.id) {
      return {
        ok: false,
        reason: "self",
        message: "Tidak bisa menghapus akun sendiri.",
      };
    }

    const target = await authService.findAccountById(targetId);
    if (!target) {
      return {
        ok: false,
        reason: "not_found",
        message: "Akun tidak ditemukan.",
      };
    }

    const assignableRoles = listAssignableRoles(actingUser.role);
    if (!assignableRoles.includes(target.role)) {
      return {
        ok: false,
        reason: "forbidden_role",
        message: "Anda tidak bisa menghapus akun dengan peran ini.",
      };
    }

    const isActiveManager =
      target.status === "active" &&
      ROLE_PERMISSIONS[target.role].includes("assign_leader_roles");
    const remainingManagers = isActiveManager
      ? await authService.countOtherActiveAccountManagers(targetId)
      : null;
    if (remainingManagers === 0) {
      return {
        ok: false,
        reason: "last_manager",
        message: "Tidak bisa menghapus kepsek atau admin aktif terakhir.",
      };
    }

    await authService.removeAccount(targetId);
    return { ok: true, admin: toAdminResponse(target, actingUser) };
  } catch (error) {
    console.error(`admin.deleteAdmin failed for ${targetId}:`, error);
    throw error;
  }
}

export async function cleanupStaleActionTokens(): Promise<number> {
  try {
    const deleted = await withDbLogging("admin.deleteStaleActionTokens", () =>
      repository.deleteStaleActionTokens(),
    );
    return deleted;
  } catch (error) {
    console.error("admin.cleanupStaleActionTokens failed:", error);
    throw error;
  }
}

async function checkActionToken(
  rawToken: string,
  purpose: AdminActionTokenPurpose,
): Promise<CheckedActionToken> {
  const tokenHash = hashRefreshToken(rawToken);
  const actionToken = await withDbLogging("admin.findActionTokenByHash", () =>
    repository.findActionTokenByHash(tokenHash, purpose),
  );
  if (!actionToken || actionToken.used_at) return { status: "invalid_token" };

  if (new Date(actionToken.expires_at).getTime() < Date.now()) {
    return { status: "expired" };
  }

  const admin = await authService.findAccountById(actionToken.user_id);
  if (!admin || (purpose === "reset" && admin.status !== "active")) {
    return { status: "invalid_token" };
  }

  const checked: CheckedActionToken = { status: "valid", actionToken, admin };
  return checked;
}
