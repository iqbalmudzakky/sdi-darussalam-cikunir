import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as facilityService from "@/modules/facility/service";
import { SaveFacilityRequestSchema } from "@/modules/facility/dto";

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
  const parsed = SaveFacilityRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const facility = await facilityService.updateFacility(id, parsed.data);
    return NextResponse.json(facility);
  } catch (error) {
    console.error(`PUT /api/facilities/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to update facility" },
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
    await facilityService.deleteFacility(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/facilities/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete facility" },
      { status: 500 },
    );
  }
}
