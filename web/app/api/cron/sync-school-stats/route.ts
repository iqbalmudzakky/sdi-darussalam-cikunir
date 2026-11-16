import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as schoolProfileService from "@/modules/school-profile/service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await schoolProfileService.syncStatsFromSso();
    if (!result.ok) {
      return NextResponse.json(
        { error: "Gagal mengambil angka sekolah dari SSO." },
        { status: 502 },
      );
    }

    revalidatePath("/");
    return NextResponse.json(result.stats);
  } catch (error) {
    console.error("GET /api/cron/sync-school-stats failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan angka sekolah." },
      { status: 500 },
    );
  }
}
