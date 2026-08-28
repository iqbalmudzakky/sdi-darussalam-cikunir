import { NextResponse } from "next/server";
import { getDokuConfig, NOTIFICATION_REQUEST_TARGET } from "@/modules/payment/config";
import { generateDigest, verifySignature } from "@/modules/payment/signature";
import * as paymentService from "@/modules/payment/service";
import type { DokuNotification } from "@/modules/payment/entity";

/*
 * Tanda tangan mencakup byte persis yang dikirim DOKU, jadi body dibaca
 * sebagai teks mentah dan baru di-parse setelah lolos verifikasi.
 */
export async function POST(request: Request) {
  const { clientId, secretKey } = getDokuConfig();

  const rawBody = await request.text();

  const requestId = request.headers.get("Request-Id");
  const requestTimestamp = request.headers.get("Request-Timestamp");
  const signature = request.headers.get("Signature");
  const receivedClientId = request.headers.get("Client-Id");

  if (!requestId || !requestTimestamp || !signature) {
    console.warn("[doku] notification missing required headers");
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  /* Memakai Client-Id milik kita, bukan dari header, supaya pengirim tidak
   * bisa memilih identitas untuk tanda tangan palsunya. */
  if (receivedClientId !== clientId) {
    console.warn("[doku] notification Client-Id mismatch");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAuthentic = verifySignature(
    {
      clientId,
      requestId,
      requestTimestamp,
      requestTarget: NOTIFICATION_REQUEST_TARGET,
      digest: generateDigest(rawBody),
    },
    secretKey,
    signature,
  );

  if (!isAuthentic) {
    console.warn("[doku] notification signature verification failed");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: DokuNotification;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const outcome = await paymentService.applyNotification(requestId, body);
    return NextResponse.json({ received: true, outcome });
  } catch (error) {
    /* Jawaban non-2xx membuat DOKU mengulang, dan itu yang diinginkan. */
    console.error("POST /api/payments/doku/notification failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
