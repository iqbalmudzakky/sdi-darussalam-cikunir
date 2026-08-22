import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as facilityService from "@/modules/facility/service";
import { SaveFacilityRequestSchema } from "@/modules/facility/dto";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const facilities = await facilityService.listFacilities();
    return NextResponse.json(facilities);
  } catch (error) {
    console.error("GET /api/facilities failed:", error);
    return NextResponse.json(
      { error: "Failed to list facilities" },
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
  const parsed = SaveFacilityRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const facility = await facilityService.createFacility(parsed.data);
    return NextResponse.json(facility, { status: 201 });
  } catch (error) {
    console.error("POST /api/facilities failed:", error);
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 },
    );
  }
}
