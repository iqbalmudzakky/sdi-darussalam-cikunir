import { NextResponse } from "next/server";
import * as registrationLinkService from "@/modules/registration-link/service";
import {
  FullFormRequestSchema,
  type SubmitFullFormInput,
} from "@/modules/registration-link/dto";
import { REGISTRATION_FAILURE } from "@/modules/shared/constant/admission/registration";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = await request.json();

  const parsed = FullFormRequestSchema.safeParse(body);
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
    const input: SubmitFullFormInput = { token, request: parsed.data };
    const result = await registrationLinkService.submitFullForm(input);
    if (!result.ok) {
      const failure = REGISTRATION_FAILURE[result.reason];
      return NextResponse.json(
        { error: failure.message },
        { status: failure.status },
      );
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/registrations/form failed:", error);
    return NextResponse.json(
      { error: "Gagal mengirim form lengkap." },
      { status: 500 },
    );
  }
}
