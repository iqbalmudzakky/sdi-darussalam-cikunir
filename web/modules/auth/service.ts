import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/modules/crypto/tokens";
import { comparePassword } from "@/modules/crypto/hash";
import {
  LOGIN_RATE_LIMIT_MAX_PER_EMAIL,
  LOGIN_RATE_LIMIT_MAX_PER_IP,
  LOGIN_RATE_LIMIT_WINDOW_MINUTES,
} from "@/modules/shared/constant/auth";
import type {
  AdminCredentials,
  AdminPatch,
  AdminSummary,
  CountLoginAttemptsInput,
  NewInvitedAdmin,
  NewLoginAttempt,
  NewRefreshToken,
} from "./entity";
import type { LoginRequest, LoginResult, SessionUser, TokenPair } from "./dto";

export async function issueTokenPair(user: SessionUser): Promise<TokenPair> {
  const accessToken = await signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAtMs = Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000;
  const expiresAt = new Date(expiresAtMs).toISOString();

  const newRefreshToken: NewRefreshToken = {
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    revoked_at: null,
  };
  await withDbLogging("auth.insertRefreshToken", () =>
    repository.insertRefreshToken(newRefreshToken),
  );

  const tokenPair: TokenPair = {
    accessToken,
    refreshToken,
    user,
  };
  return tokenPair;
}

export async function login(
  input: LoginRequest,
  ipAddress: string,
): Promise<LoginResult> {
  try {
    const attemptEmail = input.email.toLowerCase();
    const countInput: CountLoginAttemptsInput = {
      email: attemptEmail,
      ipAddress,
      windowMinutes: LOGIN_RATE_LIMIT_WINDOW_MINUTES,
    };
    const counts = await withDbLogging("auth.countRecentLoginAttempts", () =>
      repository.countRecentLoginAttempts(countInput),
    );
    if (
      counts.by_email >= LOGIN_RATE_LIMIT_MAX_PER_EMAIL ||
      counts.by_ip >= LOGIN_RATE_LIMIT_MAX_PER_IP
    ) {
      const rateLimited: LoginResult = { ok: false, reason: "rate_limited" };
      return rateLimited;
    }

    const admin = await withDbLogging("auth.findByEmail", () =>
      repository.findByEmail(input.email),
    );
    const passwordHash =
      admin?.status === "active" ? admin.password_hash : null;
    const passwordMatches = passwordHash
      ? await comparePassword(input.password, passwordHash)
      : false;
    if (!admin || !passwordMatches) {
      const attempt: NewLoginAttempt = {
        email: attemptEmail,
        ip_address: ipAddress,
      };
      await withDbLogging("auth.insertLoginAttempt", () =>
        repository.insertLoginAttempt(attempt),
      );
      const invalid: LoginResult = {
        ok: false,
        reason: "invalid_credentials",
      };
      return invalid;
    }

    await withDbLogging("auth.deleteLoginAttemptsForEmail", () =>
      repository.deleteLoginAttemptsForEmail(attemptEmail),
    );
    const user: SessionUser = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
    };
    const tokens = await issueTokenPair(user);
    const success: LoginResult = { ok: true, tokens };
    return success;
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

export async function findAccountByEmail(
  email: string,
): Promise<AdminCredentials | null> {
  const admin = await withDbLogging("auth.findByEmail", () =>
    repository.findByEmail(email),
  );
  return admin;
}

export async function findAccountById(
  id: string,
): Promise<AdminSummary | null> {
  const admin = await withDbLogging("auth.findById", () =>
    repository.findById(id),
  );
  return admin;
}

export async function listAccounts(): Promise<AdminSummary[]> {
  const admins = await withDbLogging("auth.listAdmins", () =>
    repository.listAdmins(),
  );
  return admins;
}

export async function createInvitedAccount(
  email: string,
): Promise<AdminSummary> {
  const newAdmin: NewInvitedAdmin = { email };
  const admin = await withDbLogging("auth.insertInvitedAdmin", () =>
    repository.insertInvitedAdmin(newAdmin),
  );
  return admin;
}

export async function updateAccount(
  id: string,
  patch: AdminPatch,
): Promise<AdminSummary> {
  const admin = await withDbLogging("auth.updateAdmin", () =>
    repository.updateAdmin(id, patch),
  );
  return admin;
}

export async function activateAccount(
  id: string,
  passwordHash: string,
): Promise<AdminSummary> {
  const admin = await withDbLogging("auth.setPasswordAndActivate", () =>
    repository.setPasswordAndActivate(id, passwordHash),
  );
  return admin;
}

export async function updateAccountPassword(
  id: string,
  passwordHash: string,
): Promise<AdminSummary> {
  const admin = await withDbLogging("auth.updatePassword", () =>
    repository.updatePassword(id, passwordHash),
  );
  return admin;
}

export async function removeAccount(id: string): Promise<void> {
  await withDbLogging("auth.removeAdmin", () => repository.removeAdmin(id));
}

export async function countActiveSuperadmins(
  excludeId: string,
): Promise<number> {
  const count = await withDbLogging("auth.countActiveSuperadmins", () =>
    repository.countActiveSuperadmins(excludeId),
  );
  return count;
}

export async function revokeAllSessions(userId: string): Promise<void> {
  await withDbLogging("auth.revokeAllRefreshTokensForUser", () =>
    repository.revokeAllRefreshTokensForUser(userId),
  );
}

export async function cleanupStaleSessions(): Promise<{
  refreshTokensDeleted: number;
  loginAttemptsDeleted: number;
}> {
  try {
    const refreshTokensDeleted = await withDbLogging(
      "auth.deleteStaleRefreshTokens",
      () => repository.deleteStaleRefreshTokens(),
    );
    const loginAttemptsDeleted = await withDbLogging(
      "auth.deleteStaleLoginAttempts",
      () => repository.deleteStaleLoginAttempts(),
    );
    const result = { refreshTokensDeleted, loginAttemptsDeleted };
    return result;
  } catch (error) {
    console.error("auth.cleanupStaleSessions failed:", error);
    throw error;
  }
}
