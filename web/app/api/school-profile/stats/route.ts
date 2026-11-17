import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as schoolProfileService from "@/modules/school-profile/service";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await schoolProfileService.getSchoolProfileStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/school-profile/stats failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat angka sekolah." },
      { status: 500 },
    );
  }
}
