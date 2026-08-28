import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as registrationService from "@/modules/registration/service";
import {
  CreatePpdbRegistrationRequestSchema,
  ListRegistrationsQuerySchema,
} from "@/modules/registration/dto";
import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

export async function GET(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;

  const parsed = ListRegistrationsQuerySchema.safeParse({
    search: searchParams.get("search") ?? undefined,
    statuses: searchParams.getAll("status"),
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
    const registrations = await registrationService.listRegistrations(
      parsed.data,
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

  const parsed = CreatePpdbRegistrationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.issues[0]?.message ?? "Data tidak valid.",
      },
      { status: 400 },
    );
  }

  const input: CreatePpdbRegistrationRequest = {
    ...parsed.data,
    ip_address: getClientIp(request),
  };

  try {
    const result = await registrationService.createManualRegistration(input);

    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: 409 });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/registrations failed:", error);

    return NextResponse.json(
      { error: "Gagal menyimpan pendaftaran." },
      { status: 500 },
    );
  }
}
