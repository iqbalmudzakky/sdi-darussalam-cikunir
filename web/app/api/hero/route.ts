import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import { getHeroContent, updateHeroContent } from "@/lib/data/hero";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const hero = await getHeroContent();
    return NextResponse.json(hero);
  } catch (error) {
    console.error("GET /api/hero failed:", error);
    return NextResponse.json(
      { error: "Failed to load hero content" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const hero = await updateHeroContent(body);
    return NextResponse.json(hero);
  } catch (error) {
    console.error("PUT /api/hero failed:", error);
    return NextResponse.json(
      { error: "Failed to save hero content" },
      { status: 500 },
    );
  }
}
