import { NextResponse } from "next/server";
import { PublicCreatePpdbRegistrationRequestSchema } from "@/modules/registration/dto";
import * as paymentService from "@/modules/payment/service";
import { getClientIp } from "@/modules/shared/clientIp";

/* Biodata ditahan di registration_payments sampai DOKU mengonfirmasi bayar. */
export async function POST(request: Request) {
  const body = await request.json();

  /* Honeypot: dijawab seolah diterima supaya bot tidak sadar, tapi tetap
   * dicatat — pendaftar asli yang terkena autofill sulit dilacak tanpa log. */
  if (body.website) {
    console.warn(
      "[payment] checkout rejected by honeypot; 'website' field was filled",
    );
    return NextResponse.json({ ok: true });
  }

  const parsed = PublicCreatePpdbRegistrationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid." },
      { status: 400 },
    );
  }

  try {
    const result = await paymentService.startRegistrationPayment({
      payload: parsed.data,
      ipAddress: getClientIp(request),
      request,
    });

    if (!result.ok) {
      let status = 502;

      switch (result.reason) {
        case "registration_closed":
          status = 403;
          break;
        case "rate_limited":
          status = 429;
          break;
        case "duplicate":
          status = 409;
          break;
      }

      return NextResponse.json({ error: result.message }, { status });
    }

    return NextResponse.json(
      { payment_url: result.paymentUrl, invoice_number: result.invoiceNumber },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/payments/checkout failed:", error);
    return NextResponse.json(
      { error: "Gagal memulai pembayaran." },
      { status: 500 },
    );
  }
}
