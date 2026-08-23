import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
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
    revalidatePath("/");
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
    revalidatePath("/");
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/achievements/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete achievement" },
      { status: 500 },
    );
  }
}
