import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";
import { LoginRequestSchema } from "@/modules/auth/dto";
import { getClientIp } from "@/modules/shared/clientIp";
import { LOGIN_RATE_LIMIT_WINDOW_MINUTES } from "@/modules/shared/constant/auth";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = LoginRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const ipAddress = getClientIp(request);
    const result = await authService.login(parsed.data, ipAddress);
    if (!result.ok) {
      if (result.reason === "rate_limited") {
        return NextResponse.json(
          {
            error: `Terlalu banyak percobaan masuk. Coba lagi ${LOGIN_RATE_LIMIT_WINDOW_MINUTES} menit lagi.`,
          },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 },
      );
    }

    await setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);
    return NextResponse.json({
      email: result.tokens.user.email,
      role: result.tokens.user.role,
    });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json({ error: "Gagal login." }, { status: 500 });
  }
}
