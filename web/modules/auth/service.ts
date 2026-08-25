import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
  INVITE_TOKEN_TTL_SECONDS,
  RESET_TOKEN_TTL_SECONDS,
} from "@/modules/crypto/tokens";
import { comparePassword, hashPassword } from "@/modules/crypto/hash";
import { sendInviteEmail, sendPasswordResetEmail } from "@/modules/email/email";
import { buildAdminUrl } from "@/modules/shared/siteUrl";
import {
  FORGOT_PASSWORD_RATE_LIMIT_MAX,
  FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MINUTES,
} from "@/modules/shared/constant/auth";
import type {
  AdminSummary,
  CountActionTokensInput,
  NewAdminActionToken,
} from "./entity";
import type {
  AcceptInviteRequest,
  AdminMutationResult,
  AdminResponse,
  CredentialFlowResult,
  DeleteAdminInput,
  ForgotPasswordRequest,
  InviteAdminRequest,
  InviteAdminResult,
  LoginRequest,
  ResetPasswordRequest,
  SessionUser,
  TokenPair,
  UpdateAdminInput,
} from "./dto";

async function issueTokenPair(user: SessionUser): Promise<TokenPair> {
  const accessToken = await signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000,
  ).toISOString();

  await withDbLogging("auth.insertRefreshToken", () =>
    repository.insertRefreshToken({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      revoked_at: null,
    }),
  );

  const tokenPair: TokenPair = { accessToken, refreshToken, user };
  return tokenPair;
}

export async function login(input: LoginRequest): Promise<TokenPair | null> {
  try {
    const admin = await withDbLogging("auth.findByEmail", () =>
      repository.findByEmail(input.email),
    );
    if (!admin) return null;
    if (admin.status !== "active" || !admin.password_hash) return null;

    const passwordMatches = await comparePassword(
      input.password,
      admin.password_hash,
    );
    if (!passwordMatches) return null;

    const user: SessionUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const tokens = await issueTokenPair(user);
    return tokens;
  } catch (error) {
    console.error(`auth.login failed for ${input.email}:`, error);
    throw error;
  }
}

export async function logout(refreshTokenValue: string): Promise<void> {
  try {
    const tokenHash = hashRefreshToken(refreshTokenValue);
    const existing = await withDbLogging("auth.findRefreshTokenByHash", () =>
      repository.findRefreshTokenByHash(tokenHash),
    );
    if (!existing) return;

    await withDbLogging("auth.revokeRefreshToken", () =>
      repository.revokeRefreshToken(existing.id),
    );
  } catch (error) {
    console.error("auth.logout failed:", error);
    throw error;
  }
}

export async function refreshSession(
  refreshTokenValue: string,
): Promise<TokenPair | null> {
  try {
    const tokenHash = hashRefreshToken(refreshTokenValue);
    const existing = await withDbLogging("auth.findRefreshTokenByHash", () =>
      repository.findRefreshTokenByHash(tokenHash),
    );

    if (!existing) return null;
    if (existing.revoked_at) return null;
    if (new Date(existing.expires_at).getTime() < Date.now()) return null;

    const admin = await withDbLogging("auth.findById", () =>
      repository.findById(existing.user_id),
    );
    if (!admin) return null;
    if (admin.status !== "active") return null;

    await withDbLogging("auth.revokeRefreshToken", () =>
      repository.revokeRefreshToken(existing.id),
    );

    const user: SessionUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };

    const tokens = await issueTokenPair(user);
    return tokens;
  } catch (error) {
    console.error("auth.refreshSession failed:", error);
    throw error;
  }
}

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
    const admins = await withDbLogging("auth.listAdmins", () =>
      repository.listAdmins(),
    );
    const response = admins.map(toAdminResponse);
    return response;
  } catch (error) {
    console.error("auth.listAdmins failed:", error);
    throw error;
  }
}

async function issueAndSendInviteToken(
  userId: string,
  email: string,
): Promise<void> {
  const rawToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(rawToken);
  const expiresAt = new Date(
    Date.now() + INVITE_TOKEN_TTL_SECONDS * 1000,
  ).toISOString();

  const newActionToken: NewAdminActionToken = {
    user_id: userId,
    purpose: "invite",
    token_hash: tokenHash,
    expires_at: expiresAt,
  };
  await withDbLogging("auth.insertActionToken", () =>
    repository.insertActionToken(newActionToken),
  );

  const inviteUrl = buildAdminUrl(`/admin/invite/${rawToken}`);
  await sendInviteEmail({ to: email, inviteUrl });
}

export async function inviteAdmin(
  input: InviteAdminRequest,
): Promise<InviteAdminResult> {
  try {
    const existing = await withDbLogging("auth.findByEmail", () =>
      repository.findByEmail(input.email),
    );
    if (existing) {
      return {
        ok: false,
        reason: "already_exists",
        message: "Email sudah terdaftar sebagai admin.",
      };
    }

    const admin = await withDbLogging("auth.insertInvitedAdmin", () =>
      repository.insertInvitedAdmin({ email: input.email }),
    );

    await issueAndSendInviteToken(admin.id, admin.email);

    return { ok: true, admin: toAdminResponse(admin) };
  } catch (error) {
    console.error(`auth.inviteAdmin failed for ${input.email}:`, error);
    throw error;
  }
}

export async function resendInvite(id: string): Promise<InviteAdminResult> {
  try {
    const admin = await withDbLogging("auth.findById", () =>
      repository.findById(id),
    );
    if (!admin || admin.status !== "invited") {
      return {
        ok: false,
        reason: "already_exists",
        message: "Admin tidak ditemukan atau sudah aktif.",
      };
    }

    await withDbLogging("auth.invalidateActiveActionTokens", () =>
      repository.invalidateActiveActionTokens(admin.id, "invite"),
    );
    await issueAndSendInviteToken(admin.id, admin.email);

    return { ok: true, admin: toAdminResponse(admin) };
  } catch (error) {
    console.error(`auth.resendInvite failed for ${id}:`, error);
    throw error;
  }
}

async function completeTokenFlow(
  input: AcceptInviteRequest,
  purpose: "invite" | "reset",
): Promise<CredentialFlowResult> {
  const tokenHash = hashRefreshToken(input.token);
  const actionToken = await withDbLogging("auth.findActionTokenByHash", () =>
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

  const admin = await withDbLogging("auth.findById", () =>
    repository.findById(actionToken.user_id),
  );
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
      ? await activateInvitedAdmin(admin, passwordHash)
      : await applyNewPassword(admin, passwordHash);
  await withDbLogging("auth.markActionTokenUsed", () =>
    repository.markActionTokenUsed(actionToken.id),
  );

  const user: SessionUser = {
    id: updated.id,
    email: updated.email,
    role: updated.role,
  };
  const tokens = await issueTokenPair(user);
  const result: CredentialFlowResult = { ok: true, tokens };
  return result;
}

async function activateInvitedAdmin(
  admin: AdminSummary,
  passwordHash: string,
): Promise<AdminSummary> {
  const updated = await withDbLogging("auth.setPasswordAndActivate", () =>
    repository.setPasswordAndActivate(admin.id, passwordHash),
  );
  return updated;
}

async function applyNewPassword(
  admin: AdminSummary,
  passwordHash: string,
): Promise<AdminSummary> {
  const updated = await withDbLogging("auth.updatePassword", () =>
    repository.updatePassword(admin.id, passwordHash),
  );
  return updated;
}

export async function acceptInvite(
  input: AcceptInviteRequest,
): Promise<CredentialFlowResult> {
  try {
    const result = await completeTokenFlow(input, "invite");
    return result;
  } catch (error) {
    console.error("auth.acceptInvite failed:", error);
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
    console.error("auth.resetPassword failed:", error);
    throw error;
  }
}

export async function forgotPassword(
  input: ForgotPasswordRequest,
): Promise<void> {
  try {
    const admin = await withDbLogging("auth.findByEmail", () =>
      repository.findByEmail(input.email),
    );
    if (!admin || admin.status !== "active") return;

    const countInput: CountActionTokensInput = {
      userId: admin.id,
      purpose: "reset",
      windowMinutes: FORGOT_PASSWORD_RATE_LIMIT_WINDOW_MINUTES,
    };
    const recentCount = await withDbLogging(
      "auth.countRecentActionTokens",
      () => repository.countRecentActionTokens(countInput),
    );
    if (recentCount >= FORGOT_PASSWORD_RATE_LIMIT_MAX) return;

    await withDbLogging("auth.invalidateActiveActionTokens", () =>
      repository.invalidateActiveActionTokens(admin.id, "reset"),
    );

    const rawToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(rawToken);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_SECONDS * 1000,
    ).toISOString();

    const newActionToken: NewAdminActionToken = {
      user_id: admin.id,
      purpose: "reset",
      token_hash: tokenHash,
      expires_at: expiresAt,
    };
    await withDbLogging("auth.insertActionToken", () =>
      repository.insertActionToken(newActionToken),
    );

    const resetUrl = buildAdminUrl(`/admin/reset-password/${rawToken}`);
    await sendPasswordResetEmail({ to: admin.email, resetUrl });
  } catch (error) {
    console.error(`auth.forgotPassword failed for ${input.email}:`, error);
    throw error;
  }
}

export async function updateAdmin(
  input: UpdateAdminInput,
): Promise<AdminMutationResult> {
  const { actingUserId, targetId, patch } = input;
  try {
    const target = await withDbLogging("auth.findById", () =>
      repository.findById(targetId),
    );
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
      const remaining = await withDbLogging("auth.countActiveSuperadmins", () =>
        repository.countActiveSuperadmins(targetId),
      );
      if (remaining === 0) {
        return {
          ok: false,
          reason: "last_superadmin",
          message: "Tidak bisa mengubah superadmin aktif terakhir.",
        };
      }
    }

    const updated = await withDbLogging("auth.updateAdmin", () =>
      repository.updateAdmin(targetId, patch),
    );
    if (patch.status === "deactivated") {
      await withDbLogging("auth.revokeAllRefreshTokensForUser", () =>
        repository.revokeAllRefreshTokensForUser(targetId),
      );
    }
    return { ok: true, admin: toAdminResponse(updated) };
  } catch (error) {
    console.error(`auth.updateAdmin failed for ${targetId}:`, error);
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

    const target = await withDbLogging("auth.findById", () =>
      repository.findById(targetId),
    );
    if (!target) {
      return {
        ok: false,
        reason: "not_found",
        message: "Admin tidak ditemukan.",
      };
    }

    if (target.role === "superadmin" && target.status === "active") {
      const remaining = await withDbLogging("auth.countActiveSuperadmins", () =>
        repository.countActiveSuperadmins(targetId),
      );
      if (remaining === 0) {
        return {
          ok: false,
          reason: "last_superadmin",
          message: "Tidak bisa menghapus superadmin aktif terakhir.",
        };
      }
    }

    await withDbLogging("auth.removeAdmin", () =>
      repository.removeAdmin(targetId),
    );
    return { ok: true, admin: toAdminResponse(target) };
  } catch (error) {
    console.error(`auth.deleteAdmin failed for ${targetId}:`, error);
    throw error;
  }
}

export async function cleanupExpiredTokens(): Promise<{
  refreshTokensDeleted: number;
  actionTokensDeleted: number;
}> {
  try {
    const refreshTokensDeleted = await withDbLogging(
      "auth.deleteStaleRefreshTokens",
      () => repository.deleteStaleRefreshTokens(),
    );
    const actionTokensDeleted = await withDbLogging(
      "auth.deleteStaleActionTokens",
      () => repository.deleteStaleActionTokens(),
    );
    const result = { refreshTokensDeleted, actionTokensDeleted };
    return result;
  } catch (error) {
    console.error("auth.cleanupExpiredTokens failed:", error);
    throw error;
  }
}
