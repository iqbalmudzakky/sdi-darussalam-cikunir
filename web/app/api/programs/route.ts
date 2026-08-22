import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as programService from "@/modules/program/service";
import { SaveProgramRequestSchema } from "@/modules/program/dto";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const programs = await programService.listPrograms();
    return NextResponse.json(programs);
  } catch (error) {
    console.error("GET /api/programs failed:", error);
    return NextResponse.json(
      { error: "Failed to list programs" },
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
  const parsed = SaveProgramRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const program = await programService.createProgram(parsed.data);
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs failed:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 },
    );
  }
}
