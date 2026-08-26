import { NextResponse } from "next/server";
import { getDokuConfig, NOTIFICATION_REQUEST_TARGET } from "@/modules/payment/config";
import { generateDigest, verifySignature } from "@/modules/payment/signature";
import * as paymentService from "@/modules/payment/service";
import type { DokuNotification } from "@/modules/payment/entity";

/**
 * DOKU HTTP Notification endpoint.
 *
 * The signature covers the exact bytes DOKU sent, so the body is read as raw
 * text and only parsed after verification. Anything that fails verification is
 * rejected before it can touch the database.
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

  // Sign with our own configured Client-Id rather than the header value, so a
  // caller cannot pick the identity their forged signature was built for.
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
    // Answering non-2xx makes DOKU retry, which is what we want for a
    // transient database failure.
    console.error("POST /api/payments/doku/notification failed:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
