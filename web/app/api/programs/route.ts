import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { listPrograms, createProgram } from "@/lib/data/programs";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const programs = await listPrograms();
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
  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  try {
    const program = await createProgram(body);
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("POST /api/programs failed:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 },
    );
  }
}
