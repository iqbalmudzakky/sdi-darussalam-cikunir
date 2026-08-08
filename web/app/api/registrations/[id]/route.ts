import { NextResponse } from "next/server";
import { requireUser } from "@/lib/supabase/server";
import * as registrationService from "@/modules/registration/service";
import { UpdateRegistrationStatusRequestSchema } from "@/modules/registration/dto";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const parsed = UpdateRegistrationStatusRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const registration = await registrationService.updateRegistrationStatus(
      id,
      parsed.data.status,
    );
    return NextResponse.json(registration);
  } catch (error) {
    console.error(`PATCH /api/registrations/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal memperbarui status." },
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
    await registrationService.deleteRegistration(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE /api/registrations/${id} failed:`, error);
    return NextResponse.json(
      { error: "Failed to delete registration" },
      { status: 500 },
    );
  }
}
