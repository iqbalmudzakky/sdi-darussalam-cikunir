import { NextResponse } from "next/server";
import * as paymentSettingsService from "@/modules/payment-settings/service";

/* Publik, tanpa cache — supaya tidak ikut basi bersama HTML landing yang di-ISR. */
export async function GET() {
  try {
    const open = await paymentSettingsService.isRegistrationOpen();
    return NextResponse.json({ open });
  } catch (error) {
    console.error("GET /api/registration-window failed:", error);
    return NextResponse.json({ open: false }, { status: 500 });
  }
}
