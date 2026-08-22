import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";
import { LoginRequestSchema } from "@/modules/auth/dto";
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
    const result = await authService.login(parsed.data);
    if (!result) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 },
      );
    }

    await setAuthCookies(result.accessToken, result.refreshToken);
    return NextResponse.json({
      email: result.user.email,
      role: result.user.role,
    });
  } catch (error) {
    console.error("POST /api/auth/login failed:", error);
    return NextResponse.json({ error: "Gagal login." }, { status: 500 });
  }
}
