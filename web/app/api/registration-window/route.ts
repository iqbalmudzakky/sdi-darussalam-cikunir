import { NextResponse } from "next/server";
import * as registrationIntakeService from "@/modules/registration-intake/service";
import { ShortFormOptionsQuerySchema } from "@/modules/registration-intake/dto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = {
    registration_type: searchParams.get("registration_type") ?? undefined,
    full_name: searchParams.get("full_name") ?? undefined,
    birth_date: searchParams.get("birth_date") ?? undefined,
    academic_year: searchParams.get("academic_year") ?? undefined,
  };
  const query = ShortFormOptionsQuerySchema.parse(rawQuery);

  try {
    const options = await registrationIntakeService.getShortFormOptions(query);
    return NextResponse.json(options);
  } catch (error) {
    console.error("GET /api/registration-window failed:", error);
    return NextResponse.json({ open: false }, { status: 500 });
  }
}
