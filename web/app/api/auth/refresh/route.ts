import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";
import {
  getRefreshTokenCookie,
  setAuthCookies,
  clearAuthCookies,
} from "@/lib/auth/cookies";

export async function POST() {
  const refreshToken = await getRefreshTokenCookie();
  if (!refreshToken) {
    return NextResponse.json(
      { error: "Sesi tidak ditemukan." },
      { status: 401 },
    );
  }

  try {
    const result = await authService.refreshSession(refreshToken);
    if (!result) {
      await clearAuthCookies();
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    await setAuthCookies(result.accessToken, result.refreshToken);
    return NextResponse.json({
      email: result.user.email,
      role: result.user.role,
    });
  } catch (error) {
    console.error("POST /api/auth/refresh failed:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui sesi." },
      { status: 500 },
    );
  }
}
