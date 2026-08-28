import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/*
 * Tanda tangan DOKU non-SNAP (Checkout). Dua arah — request kita ke DOKU dan
 * notifikasi DOKU ke kita — memakai HMAC-SHA256 yang sama; yang berbeda hanya
 * Request-Target. Keypair RSA hanya untuk API SNAP, tidak dipakai di sini.
 */

/* SHA-256 dari body JSON mentah, dikodekan base64. */
export function generateDigest(rawJsonBody: string): string {
  return createHash("sha256").update(rawJsonBody, "utf8").digest("base64");
}

type SignatureComponents = {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  /* Hanya path, mis. "/checkout/v1/payment", bukan URL lengkap. */
  requestTarget: string;
  /* Tidak dipakai untuk GET/DELETE yang tanpa body. */
  digest?: string;
};

/**
 * Builds the component string DOKU signs: one `Name:value` per line joined by
 * "\n", with no trailing newline. Order is part of the contract.
 */
export function buildComponentSignature({
  clientId,
  requestId,
  requestTimestamp,
  requestTarget,
  digest,
}: SignatureComponents): string {
  const lines = [
    `Client-Id:${clientId}`,
    `Request-Id:${requestId}`,
    `Request-Timestamp:${requestTimestamp}`,
    `Request-Target:${requestTarget}`,
  ];

  if (digest) lines.push(`Digest:${digest}`);

  return lines.join("\n");
}

/* Nilai header lengkap, termasuk awalan `HMACSHA256=`. */
export function generateSignature(
  components: SignatureComponents,
  secretKey: string,
): string {
  const signature = createHmac("sha256", secretKey)
    .update(buildComponentSignature(components), "utf8")
    .digest("base64");

  return `HMACSHA256=${signature}`;
}

/* Dibandingkan dalam waktu tetap supaya selisihnya tidak bocor lewat timing. */
export function verifySignature(
  components: SignatureComponents,
  secretKey: string,
  receivedSignature: string | null,
): boolean {
  if (!receivedSignature) return false;

  const expected = Buffer.from(generateSignature(components, secretKey));
  const received = Buffer.from(receivedSignature);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(expected, received);
}

/* ISO8601 UTC+0 tanpa milidetik: `2020-08-11T08:45:42Z`. */
export function currentRequestTimestamp(date = new Date()): string {
  return `${date.toISOString().slice(0, 19)}Z`;
}
