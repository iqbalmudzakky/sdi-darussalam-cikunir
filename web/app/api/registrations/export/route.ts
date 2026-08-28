import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as registrationService from "@/modules/registration/service";
import { ExportRegistrationsQuerySchema } from "@/modules/registration/dto";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;

  const parsed = ExportRegistrationsQuerySchema.safeParse({
    statuses: searchParams.getAll("status"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Query tidak valid." },
      { status: 400 },
    );
  }

  try {
    const { buffer, filename } = await registrationService.exportRegistrations(
      parsed.data,
    );

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/registrations/export failed:", error);

    return NextResponse.json(
      { error: "Gagal membuat file Excel data pendaftar." },
      { status: 500 },
    );
  }
}
