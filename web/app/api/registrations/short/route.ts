import { NextResponse } from "next/server";
import * as registrationIntakeService from "@/modules/registration-intake/service";
import {
  ShortRegistrationRequestSchema,
  type CreateShortRegistrationInput,
  type CreateShortRegistrationResult,
} from "@/modules/registration-intake/dto";
import { getClientIp } from "@/modules/shared/web/clientIp";
import { REGISTRATION_FAILURE } from "@/modules/shared/constant/admission/registration";

export async function POST(request: Request) {
  const body = await request.json();

  if (body.website) {
    console.warn("[registration] short form rejected by honeypot");
    const ignored: CreateShortRegistrationResult = {
      ok: true,
      registration_number: "-",
      whatsapp_url: null,
      flow_steps: [],
    };
    return NextResponse.json(ignored);
  }

  const parsed = ShortRegistrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return NextResponse.json(
      { error: "Periksa lagi isian.", field_errors: fieldErrors },
      { status: 400 },
    );
  }

  try {
    const input: CreateShortRegistrationInput = {
      request: parsed.data,
      ipAddress: getClientIp(request),
    };
    const result =
      await registrationIntakeService.createShortRegistration(input);

    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message, whatsapp_url: result.whatsapp_url },
        { status: failure.status },
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/registrations/short failed:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pendaftaran." },
      { status: 500 },
    );
  }
}
