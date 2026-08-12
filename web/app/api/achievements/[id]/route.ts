import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import * as achievementService from "@/modules/achievement/service";
import { SaveAchievementRequestSchema } from "@/modules/achievement/dto";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = SaveAchievementRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const achievement = await achievementService.updateAchievement(
      id,
      parsed.data,
    );
    return NextResponse.json(achievement);
  } catch (error) {
    console.error(`PUT /api/achievements/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to update achievement" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await achievementService.deleteAchievement(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/achievements/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete achievement" },
      { status: 500 },
    );
  }
}
