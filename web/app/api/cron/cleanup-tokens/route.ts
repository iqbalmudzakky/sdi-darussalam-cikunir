import { NextResponse } from "next/server";
import * as authService from "@/modules/auth/service";
import * as adminService from "@/modules/admin/service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await authService.cleanupStaleSessions();
    const actionTokensDeleted = await adminService.cleanupStaleActionTokens();
    return NextResponse.json({
      refreshTokensDeleted: sessions.refreshTokensDeleted,
      actionTokensDeleted,
      loginAttemptsDeleted: sessions.loginAttemptsDeleted,
    });
  } catch (error) {
    console.error("GET /api/cron/cleanup-tokens failed:", error);
    return NextResponse.json(
      { error: "Gagal membersihkan token." },
      { status: 500 },
    );
  }
}
