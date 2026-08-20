import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import * as schoolProfileService from "@/modules/school-profile/service";
import { SaveSchoolProfileRequestSchema } from "@/modules/school-profile/dto";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await schoolProfileService.getSchoolProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error("GET /api/school-profile failed:", error);
    return NextResponse.json(
      { error: "Failed to load school profile" },
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
  const parsed = SaveSchoolProfileRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const profile = await schoolProfileService.saveSchoolProfile(parsed.data);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("PUT /api/school-profile failed:", error);
    return NextResponse.json(
      { error: "Failed to save school profile" },
      { status: 500 },
    );
  }
}
