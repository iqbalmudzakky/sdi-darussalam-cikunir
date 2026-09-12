import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import * as registrationStatsService from "@/modules/registration-stats/service";
import {
  CreateAcademicYearRequestSchema,
  SaveOfflineCountRequestSchema,
} from "@/modules/registration-stats/dto";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const years = await registrationStatsService.listAcademicYears();
    return NextResponse.json(years);
  } catch (error) {
    console.error("GET /api/registration-stats failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pendaftar." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateAcademicYearRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const created = await registrationStatsService.addAcademicYear(
      parsed.data.academic_year,
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/registration-stats failed:", error);
    return NextResponse.json(
      { error: "Gagal menambah tahun ajaran. Mungkin sudah ada." },
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
  const parsed = SaveOfflineCountRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const updated = await registrationStatsService.saveOfflineCount(
      parsed.data.academic_year,
      parsed.data.offline_count,
    );
    if (!updated) {
      return NextResponse.json(
        { error: "Tahun ajaran tidak ditemukan." },
        { status: 404 },
      );
    }

    revalidatePath("/");
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/registration-stats failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jumlah pendaftar offline." },
      { status: 500 },
    );
  }
}
