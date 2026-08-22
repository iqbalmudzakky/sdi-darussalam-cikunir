import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";
import { getRefreshTokenCookie, clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
  const refreshToken = await getRefreshTokenCookie();

  try {
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
  } catch (error) {
    console.error("POST /api/auth/logout failed:", error);
  }

  await clearAuthCookies();
  return new NextResponse(null, { status: 204 });
}
