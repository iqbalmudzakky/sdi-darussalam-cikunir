import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import {
  getSchoolProfile,
  updateSchoolProfile,
} from "@/lib/data/schoolProfile";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await getSchoolProfile();
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

  try {
    const profile = await updateSchoolProfile(body);
    return NextResponse.json(profile);
  } catch (error) {
    console.error("PUT /api/school-profile failed:", error);
    return NextResponse.json(
      { error: "Failed to save school profile" },
      { status: 500 },
    );
  }
}
