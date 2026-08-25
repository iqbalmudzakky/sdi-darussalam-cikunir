import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";
import { ResetPasswordRequestSchema } from "@/modules/auth/dto";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ResetPasswordRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const result = await authService.resetPassword(parsed.data);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.message, reason: result.reason },
        { status: 400 },
      );
    }

    await setAuthCookies(result.tokens.accessToken, result.tokens.refreshToken);
    return NextResponse.json({
      email: result.tokens.user.email,
      role: result.tokens.user.role,
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password failed:", error);
    return NextResponse.json(
      { error: "Gagal mereset password." },
      { status: 500 },
    );
  }
}
