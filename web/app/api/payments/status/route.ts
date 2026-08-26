import { NextResponse } from "next/server";
import * as paymentService from "@/modules/payment/service";

/**
 * Public payment status lookup for the post-checkout result page. Returns only
 * what that page renders — never the full biodata held in `payload`.
 */
export async function GET(request: Request) {
  const invoiceNumber = new URL(request.url).searchParams.get("invoice");

  if (!invoiceNumber) {
    return NextResponse.json(
      { error: "Nomor invoice tidak ditemukan." },
      { status: 400 },
    );
  }

  try {
    const status = await paymentService.getPaymentStatus(invoiceNumber);
    if (!status) {
      return NextResponse.json(
        { error: "Data pembayaran tidak ditemukan." },
        { status: 404 },
      );
    }
    return NextResponse.json(status);
  } catch (error) {
    console.error("GET /api/payments/status failed:", error);
    return NextResponse.json(
      { error: "Gagal memeriksa status pembayaran." },
      { status: 500 },
    );
  }
}
