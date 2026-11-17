import { verifyAccessToken } from "./tokens";
import { getAccessTokenCookie } from "./cookies";
import { hasPermission } from "@/modules/auth/service";

export { listPermissions } from "@/modules/auth/service";
import type { Permission } from "@/modules/shared/constant/role";
import type { SessionUser } from "@/types/Auth";

export async function getSession(): Promise<SessionUser | null> {
  const token = await getAccessTokenCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function requireUser(): Promise<SessionUser | null> {
  return getSession();
}

export async function requirePermission(
  permission: Permission,
): Promise<SessionUser | null> {
  const user = await getSession();
  if (!user || !hasPermission(user.role, permission)) return null;
  return user;
}
