import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await authService.cleanupExpiredTokens();
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/cron/cleanup-tokens failed:", error);
    return NextResponse.json(
      { error: "Gagal membersihkan token." },
      { status: 500 },
    );
  }
}
