import { SignJWT, jwtVerify } from "jose";
import { randomBytes, createHash } from "crypto";
import type { SessionUser } from "@/modules/auth/dto";

export const ACCESS_TOKEN_TTL_SECONDS = 60 * 60 * 8;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;
export const INVITE_TOKEN_TTL_SECONDS = 60 * 60 * 4;
export const RESET_TOKEN_TTL_SECONDS = 60 * 60 * 1;

function getAccessSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!);
}

export async function signAccessToken(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_TTL_SECONDS}s`)
    .sign(getAccessSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    const { sub, email, role } = payload;

    if (
      typeof sub !== "string" ||
      typeof email !== "string" ||
      (role !== "superadmin" && role !== "admin")
    ) {
      return null;
    }

    return { id: sub, email, role };
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashRefreshToken(token: string): string {
  const pepper = process.env.JWT_REFRESH_PEPPER!;
  return createHash("sha256").update(`${token}${pepper}`).digest("hex");
}
