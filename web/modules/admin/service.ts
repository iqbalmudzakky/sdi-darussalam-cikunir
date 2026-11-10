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
import { buildAdminUrl } from "@/modules/shared/siteUrl";
import {
  FORGOT_PASSWORD_RATE_LIMIT_MAX,
  FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MINUTES,
} from "@/modules/shared/constant/auth";
import type { AdminSummary } from "@/modules/auth/entity";
import type { SessionUser } from "@/modules/auth/dto";
import type { CountActionTokensInput, NewAdminActionToken } from "./entity";
import type {
  AcceptInviteRequest,
  AdminMutationResult,
  AdminResponse,
  CredentialFlowResult,
  DeleteAdminInput,
  ForgotPasswordRequest,
  InviteAdminRequest,
  InviteAdminResult,
  ResetPasswordRequest,
  UpdateAdminInput,
} from "./dto";

function toAdminResponse(admin: AdminSummary): AdminResponse {
  return {
    id: admin.id,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    created_at: admin.created_at,
  };
}

export async function listAdmins(): Promise<AdminResponse[]> {
  try {
    const admins = await authService.listAccounts();
    const response = admins.map(toAdminResponse);
    return response;
  } catch (error) {
    console.error("admin.listAdmins failed:", error);
    throw error;
  }
}

async function issueAndSendInviteToken(
  userId: string,
  email: string,
): Promise<void> {
  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);
  const expiresAtMs = Date.now() + INVITE_TOKEN_TTL_SECONDS * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();

  const newActionToken: NewAdminActionToken = {
    user_id: userId,
    purpose: "invite",
    token_hash: tokenHash,
    expires_at: expiresAt,
  };
  await withDbLogging("admin.insertActionToken", () =>
    repository.insertActionToken(newActionToken),
  );

  const invitePath = `/admin/invite/${rawToken}`;
  const inviteUrl = buildAdminUrl(invitePath);
  const inviteEmail = { to: email, inviteUrl };
  await sendInviteEmail(inviteEmail);
}

export async function inviteAdmin(
  input: InviteAdminRequest,
): Promise<InviteAdminResult> {
  try {
    const existing = await authService.findAccountByEmail(input.email);
    if (existing) {
      return {
        ok: false,
        reason: "already_exists",
        message: "Email sudah terdaftar sebagai admin.",
      };
    }

    const admin = await authService.createInvitedAccount(input.email);

    await issueAndSendInviteToken(admin.id, admin.email);

    return { ok: true, admin: toAdminResponse(admin) };
  } catch (error) {
    console.error(`admin.inviteAdmin failed for ${input.email}:`, error);
    throw error;
  }
}

export async function resendInvite(id: string): Promise<InviteAdminResult> {
  try {
    const admin = await authService.findAccountById(id);
    if (!admin || admin.status !== "invited") {
      return {
        ok: false,
        reason: "already_exists",
        message: "Admin tidak ditemukan atau sudah aktif.",
      };
    }

    await withDbLogging("admin.invalidateActiveActionTokens", () =>
      repository.invalidateActiveActionTokens(admin.id, "invite"),
    );
    await issueAndSendInviteToken(admin.id, admin.email);

    return { ok: true, admin: toAdminResponse(admin) };
  } catch (error) {
    console.error(`admin.resendInvite failed for ${id}:`, error);
    throw error;
  }
}

async function completeTokenFlow(
  input: AcceptInviteRequest,
  purpose: "invite" | "reset",
): Promise<CredentialFlowResult> {
  const tokenHash = hashRefreshToken(input.token);
  const actionToken = await withDbLogging("admin.findActionTokenByHash", () =>
    repository.findActionTokenByHash(tokenHash, purpose),
  );
  if (!actionToken || actionToken.used_at) {
    return {
      ok: false,
      reason: "invalid_token",
      message: "Tautan tidak valid atau sudah digunakan.",
    };
  }
  if (new Date(actionToken.expires_at).getTime() < Date.now()) {
    return {
      ok: false,
      reason: "expired",
      message: "Tautan sudah kedaluwarsa.",
    };
  }

  const admin = await authService.findAccountById(actionToken.user_id);
  if (!admin || (purpose === "reset" && admin.status !== "active")) {
    return {
      ok: false,
      reason: "invalid_token",
      message: "Tautan tidak valid.",
    };
  }

  const passwordHash = await hashPassword(input.password);
  const updated =
    purpose === "invite"
      ? await authService.activateAccount(admin.id, passwordHash)
      : await authService.updateAccountPassword(admin.id, passwordHash);
  await withDbLogging("admin.markActionTokenUsed", () =>
    repository.markActionTokenUsed(actionToken.id),
  );

  const user: SessionUser = {
    id: updated.id,
    email: updated.email,
    role: updated.role,
  };
  const tokens = await authService.issueTokenPair(user);
  const result: CredentialFlowResult = { ok: true, tokens };
  return result;
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

    const resetPath = `/admin/reset-password/${rawToken}`;
    const resetUrl = buildAdminUrl(resetPath);
    const resetEmail = { to: admin.email, resetUrl };
    await sendPasswordResetEmail(resetEmail);
  } catch (error) {
    console.error(`admin.forgotPassword failed for ${input.email}:`, error);
    throw error;
  }
}

export async function updateAdmin(
  input: UpdateAdminInput,
): Promise<AdminMutationResult> {
  const { actingUserId, targetId, patch } = input;
  try {
    const target = await authService.findAccountById(targetId);
    if (!target) {
      return {
        ok: false,
        reason: "not_found",
        message: "Admin tidak ditemukan.",
      };
    }

    const isSelf = targetId === actingUserId;
    const selfDemotion =
      isSelf &&
      patch.role &&
      patch.role !== "superadmin" &&
      target.role === "superadmin";
    const selfDeactivation =
      isSelf && patch.status && patch.status !== "active";
    if (selfDemotion || selfDeactivation) {
      return {
        ok: false,
        reason: "self",
        message: "Tidak bisa mengubah status atau peran akun sendiri.",
      };
    }

    const leavesActiveSuperadmin =
      target.role === "superadmin" && target.status === "active";
    const removesSuperadminStatus =
      (patch.role && patch.role !== "superadmin") ||
      (patch.status && patch.status !== "active");
    if (leavesActiveSuperadmin && removesSuperadminStatus) {
      const remaining = await authService.countActiveSuperadmins(targetId);
      if (remaining === 0) {
        return {
          ok: false,
          reason: "last_superadmin",
          message: "Tidak bisa mengubah superadmin aktif terakhir.",
        };
      }
    }

    const updated = await authService.updateAccount(targetId, patch);
    if (patch.status === "deactivated") {
      await authService.revokeAllSessions(targetId);
    }
    return { ok: true, admin: toAdminResponse(updated) };
  } catch (error) {
    console.error(`admin.updateAdmin failed for ${targetId}:`, error);
    throw error;
  }
}

export async function deleteAdmin(
  input: DeleteAdminInput,
): Promise<AdminMutationResult> {
  const { actingUserId, targetId } = input;
  try {
    if (targetId === actingUserId) {
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
        message: "Admin tidak ditemukan.",
      };
    }

    if (target.role === "superadmin" && target.status === "active") {
      const remaining = await authService.countActiveSuperadmins(targetId);
      if (remaining === 0) {
        return {
          ok: false,
          reason: "last_superadmin",
          message: "Tidak bisa menghapus superadmin aktif terakhir.",
        };
      }
    }

    await authService.removeAccount(targetId);
    return { ok: true, admin: toAdminResponse(target) };
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
