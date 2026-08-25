import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as registrationService from "@/modules/registration/service";
import { CreatePpdbRegistrationRequestSchema } from "@/modules/registration/dto";
import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const registrations = await registrationService.listRegistrations();

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("GET /api/registrations failed:", error);

    return NextResponse.json({ error: "Failed to list registrations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.website) {
    return NextResponse.json({ ok: true });
  }

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
    const result = await registrationService.createRegistration(input);

    if (!result.ok) {
      const status = result.reason === "rate_limited" ? 429 : 409;

      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/registrations failed:", error);

    return NextResponse.json({ error: "Gagal mengirim pendaftaran." }, { status: 500 });
  }
}
