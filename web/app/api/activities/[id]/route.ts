import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { updateActivity, deleteActivity } from "@/lib/data/activities";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const activity = await updateActivity(id, body);
    return NextResponse.json(activity);
  } catch {
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteActivity(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 }
    );
  }
}
