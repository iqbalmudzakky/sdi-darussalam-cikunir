import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as registrationAdminService from "@/modules/registration-admin/service";
import {
  UpdateRegistrationRequestSchema,
  type UpdateRegistrationInput,
} from "@/modules/registration-admin/dto";
import * as registrationService from "@/modules/registration/service";
import { REGISTRATION_FAILURE } from "@/modules/shared/constant/registration";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const registration =
      await registrationAdminService.getRegistrationDetail(id);
    if (!registration) {
      const failure = REGISTRATION_FAILURE.not_found;
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(registration);
  } catch (error) {
    console.error(`GET /api/registrations/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal memuat pendaftar." },
      { status: 500 },
    );
  }
}

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

  const parsed = UpdateRegistrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const input: UpdateRegistrationInput = { id, request: parsed.data };
    const result = await registrationAdminService.updateRegistration(input);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(result.registration);
  } catch (error) {
    console.error(`PATCH /api/registrations/${id} failed:`, error);
    return NextResponse.json(
      { error: "Gagal memperbarui pendaftar." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
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
      { error: "Gagal menghapus pendaftar." },
      { status: 500 },
    );
  }
}
