import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as achievementService from "@/modules/achievement/service";
import { SaveAchievementRequestSchema } from "@/modules/achievement/dto";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const achievements = await achievementService.listAchievements();
    return NextResponse.json(achievements);
  } catch (error) {
    console.error("GET /api/achievements failed:", error);
    return NextResponse.json(
      { error: "Failed to list achievements" },
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
  const parsed = SaveAchievementRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const achievement = await achievementService.createAchievement(parsed.data);
    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error("POST /api/achievements failed:", error);
    return NextResponse.json(
      { error: "Failed to create achievement" },
      { status: 500 },
    );
  }
}
