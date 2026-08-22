import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  getRefreshTokenTtlSeconds,
} from "@/modules/crypto/tokens";
import { comparePassword } from "@/modules/crypto/hash";
import type { LoginRequest, SessionUser, TokenPair } from "./dto";

async function issueTokenPair(user: SessionUser): Promise<TokenPair> {
  const accessToken = await signAccessToken(user);
  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + getRefreshTokenTtlSeconds() * 1000,
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
  const admin = await withDbLogging("auth.findByEmail", () =>
    repository.findByEmail(input.email),
  );
  if (!admin) return null;

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

  return issueTokenPair(user);
}

export async function logout(refreshTokenValue: string): Promise<void> {
  const tokenHash = hashRefreshToken(refreshTokenValue);
  const existing = await withDbLogging("auth.findRefreshTokenByHash", () =>
    repository.findRefreshTokenByHash(tokenHash),
  );
  if (!existing) return;

  await withDbLogging("auth.revokeRefreshToken", () =>
    repository.revokeRefreshToken(existing.id),
  );
}

export async function refreshSession(
  refreshTokenValue: string,
): Promise<TokenPair | null> {
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

  await withDbLogging("auth.revokeRefreshToken", () =>
    repository.revokeRefreshToken(existing.id),
  );

  const user: SessionUser = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };

  return issueTokenPair(user);
}
