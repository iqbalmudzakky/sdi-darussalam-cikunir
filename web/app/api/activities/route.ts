import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { listActivities, createActivity } from "@/lib/data/activities";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activities = await listActivities();
    return NextResponse.json(activities);
  } catch (error) {
    console.error("GET /api/activities failed:", error);
    return NextResponse.json(
      { error: "Failed to list activities" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const activity = await createActivity(body);
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("POST /api/activities failed:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
