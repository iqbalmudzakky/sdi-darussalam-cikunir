import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/session";
import { SaveAdmissionSettingsRequestSchema } from "@/modules/admission-settings/dto";
import type { SaveAdmissionSettingsInput } from "@/modules/admission-settings/entity";
import * as admissionSettingsService from "@/modules/admission-settings/service";

export async function PUT(request: Request) {
  const user = await requirePermission("manage_pmb_settings");
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SaveAdmissionSettingsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const input: SaveAdmissionSettingsInput = {
      ...parsed.data,
      actorId: user.id,
    };
    const settings = await admissionSettingsService.saveSettings(input);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("PUT /api/admission-settings failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan Pengaturan PMB." },
      { status: 500 },
    );
  }
}
