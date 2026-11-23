import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as registrationAdminService from "@/modules/registration-admin/service";
import {
  UpdateRegistrationRequestSchema,
  type UpdateRegistrationInput,
} from "@/modules/registration-admin/dto";
import * as registrationLinkService from "@/modules/registration-link/service";
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

  if (body.action === "send_form_link") {
    try {
      const whatsappUrl = await registrationLinkService.sendFormLink(
        id,
        user.id,
      );
      if (!whatsappUrl) {
        const failure = REGISTRATION_FAILURE.not_found;
        return NextResponse.json(
          { error: failure.message },
          { status: failure.status },
        );
      }
      return NextResponse.json({ whatsapp_url: whatsappUrl });
    } catch (error) {
      console.error(
        `PATCH /api/registrations/${id} send_form_link failed:`,
        error,
      );
      return NextResponse.json(
        { error: "Gagal membuat link form lengkap." },
        { status: 500 },
      );
    }
  }

  const parsed = UpdateRegistrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path[0] === "form" ? issue.path.slice(1) : issue.path;
      fieldErrors[path.join(".")] ??= issue.message;
    }
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
        field_errors: fieldErrors,
      },
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
