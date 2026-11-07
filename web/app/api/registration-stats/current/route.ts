import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import * as registrationStatsService from "@/modules/registration-stats/service";
import { SetCurrentAcademicYearRequestSchema } from "@/modules/registration-stats/dto";

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SetCurrentAcademicYearRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const updated = await registrationStatsService.setCurrentAcademicYear(
      parsed.data.academic_year,
    );
    revalidatePath("/");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/registration-stats/current failed:", error);
    return NextResponse.json(
      {
        error:
          "Gagal mengubah tahun ajaran aktif. Pastikan tahunnya sudah dibuat.",
      },
      { status: 500 },
    );
  }
}
