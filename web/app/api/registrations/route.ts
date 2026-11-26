import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as registrationAdminService from "@/modules/registration-admin/service";
import * as registrationIntakeService from "@/modules/registration-intake/service";
import { ListRegistrationsQuerySchema } from "@/modules/registration-admin/dto";
import {
  ManualRegistrationRequestSchema,
  type CreateManualRegistrationInput,
} from "@/modules/registration-intake/dto";
import { REGISTRATION_FAILURE } from "@/modules/shared/constant/admission/registration";
import { getClientIp } from "@/modules/shared/web/clientIp";

export async function GET(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;

  const parsed = ListRegistrationsQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    statuses: searchParams.getAll("status"),
    academic_year: searchParams.get("academic_year") ?? undefined,
    program: searchParams.get("program") ?? undefined,
    registration_type: searchParams.get("registration_type") ?? undefined,
    scope: searchParams.get("scope") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Query tidak valid." },
      { status: 400 },
    );
  }

  try {
    const registrations = await registrationAdminService.listRegistrations(
      parsed.data,
      user,
    );

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/registrations failed:", error);

    return NextResponse.json(
      { error: "Failed to list registrations" },
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

  const parsed = ManualRegistrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] ??= issue.message;
    }
    return NextResponse.json(
      { error: "Periksa lagi isian.", field_errors: fieldErrors },
      { status: 400 },
    );
  }

  try {
    const input: CreateManualRegistrationInput = {
      request: parsed.data,
      ipAddress: getClientIp(request),
    };
    const result =
      await registrationIntakeService.createManualRegistration(input);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/registrations failed:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan pendaftaran." },
      { status: 500 },
    );
  }
}
