import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import * as programService from "@/modules/program/service";
import { SaveProgramRequestSchema } from "@/modules/program/dto";

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
  const parsed = SaveProgramRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const program = await programService.updateProgram(id, parsed.data);
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
    await programService.deleteProgram(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/programs/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 },
    );
  }
}
