import { NextResponse } from "next/server";
import { requireSuperadmin } from "@/lib/auth/session";
import * as paymentSettingsService from "@/modules/payment-settings/service";
import { SavePaymentSettingsRequestSchema } from "@/modules/payment-settings/dto";

export async function GET() {
  const user = await requireSuperadmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await paymentSettingsService.getPaymentSettings();
    if (!settings) {
      return NextResponse.json(
        { error: "Pengaturan pembayaran belum tersedia." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      registration_fee: settings.registration_fee,
      updated_at: settings.updated_at,
    });
  } catch (error) {
    console.error("GET /api/payment-settings failed:", error);
    return NextResponse.json(
      { error: "Gagal memuat pengaturan pembayaran." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const user = await requireSuperadmin();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = SavePaymentSettingsRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const settings = await paymentSettingsService.saveRegistrationFee(
      parsed.data.registration_fee,
    );
    if (!settings) {
      return NextResponse.json(
        { error: "Pengaturan pembayaran belum tersedia." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      registration_fee: settings.registration_fee,
      updated_at: settings.updated_at,
    });
  } catch (error) {
    console.error("PUT /api/payment-settings failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan pembayaran." },
      { status: 500 },
    );
  }
}
