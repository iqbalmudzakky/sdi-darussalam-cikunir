import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as activityService from "@/modules/activity/service";
import { SaveActivityRequestSchema } from "@/modules/activity/dto";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activities = await activityService.listActivities();
    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET /api/activities failed:", error);
    return NextResponse.json(
      { error: "Failed to list activities" },
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
  const parsed = SaveActivityRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const activity = await activityService.createActivity(parsed.data);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities failed:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 },
    );
  }
}
