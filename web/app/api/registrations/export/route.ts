import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/session";
import * as registrationService from "@/modules/registration/service";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { buffer, filename } =
      await registrationService.exportRegistrations();

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
