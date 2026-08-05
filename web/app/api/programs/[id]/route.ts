import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { updateProgram, deleteProgram } from "@/lib/data/programs";

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
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const program = await updateProgram(id, body);
    return NextResponse.json(program);
  } catch (error) {
    console.error(`PUT /api/programs/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to update program" },
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
    await deleteProgram(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/programs/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 },
    );
  }
}
