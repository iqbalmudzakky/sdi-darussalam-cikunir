import { verifyAccessToken } from "./tokens";
import { getAccessTokenCookie } from "./cookies";
import type { SessionUser } from "@/types/Auth";

export async function getSession(): Promise<SessionUser | null> {
  const token = await getAccessTokenCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function requireUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function requireSuperadmin(): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user || user.role !== "superadmin") return null;
  return user;
}
