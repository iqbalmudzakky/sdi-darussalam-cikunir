import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";
import { ForgotPasswordRequestSchema } from "@/modules/auth/dto";

const GENERIC_MESSAGE =
  "Jika email terdaftar, tautan reset password telah dikirim.";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ForgotPasswordRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    await authService.forgotPassword(parsed.data);
  } catch (error) {
    console.error("POST /api/auth/forgot-password failed:", error);
  }

  return NextResponse.json({ message: GENERIC_MESSAGE });
}
