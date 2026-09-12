import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import * as schoolProfileService from "@/modules/school-profile/service";
import { SaveSchoolProfileStatsRequestSchema } from "@/modules/school-profile/dto";

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

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SaveSchoolProfileStatsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const stats = await schoolProfileService.saveSchoolProfileStats(
      parsed.data,
    );
    revalidatePath("/");
    return NextResponse.json(stats);
  } catch (error) {
    console.error("PUT /api/school-profile/stats failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan angka sekolah." },
      { status: 500 },
    );
  }
}
