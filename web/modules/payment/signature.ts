import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * DOKU non-SNAP (Checkout) signature scheme.
 *
 * Both directions — our request to DOKU and DOKU's HTTP Notification back to
 * us — use the same symmetric HMAC-SHA256 construction over a fixed component
 * string. The only thing that differs is Request-Target: our own API path when
 * we call DOKU, and our Notification URL path when DOKU calls us.
 *
 * The RSA keypair DOKU asks for elsewhere belongs to the SNAP (asymmetric)
 * APIs only and plays no part here.
 */

/** Encoded (base64) value of the SHA-256 hash of the raw JSON body. */
export function generateDigest(rawJsonBody: string): string {
  return createHash("sha256").update(rawJsonBody, "utf8").digest("base64");
}

type SignatureComponents = {
  clientId: string;
  requestId: string;
  requestTimestamp: string;
  /** Path only, e.g. "/checkout/v1/payment" — never the full URL. */
  requestTarget: string;
  /** Omitted for GET/DELETE, which carry no body. */
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

/** Returns the full header value, including the `HMACSHA256=` prefix. */
export function generateSignature(
  components: SignatureComponents,
  secretKey: string,
): string {
  const signature = createHmac("sha256", secretKey)
    .update(buildComponentSignature(components), "utf8")
    .digest("base64");

  return `HMACSHA256=${signature}`;
}

/**
 * Verifies the Signature header on an incoming DOKU HTTP Notification.
 * Compared in constant time so a mismatch leaks nothing about the expected
 * value through timing.
 */
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

/**
 * Request-Timestamp must be ISO8601 in UTC+0 with second precision and no
 * milliseconds — `2020-08-11T08:45:42Z`.
 */
export function currentRequestTimestamp(date = new Date()): string {
  return `${date.toISOString().slice(0, 19)}Z`;
}
