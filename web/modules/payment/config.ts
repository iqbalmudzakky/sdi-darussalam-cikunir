/**
 * DOKU credentials and environment. Read lazily inside functions rather than at
 * module scope so a missing variable surfaces as a clear runtime error on the
 * request that needs it, instead of breaking the whole build.
 */

const SANDBOX_BASE_URL = "https://api-sandbox.doku.com";
const PRODUCTION_BASE_URL = "https://api.doku.com";

/** Path component of the Checkout endpoint — also the Request-Target we sign. */
export const CHECKOUT_REQUEST_TARGET = "/checkout/v1/payment";

/**
 * Our own notification path. DOKU signs its callback with this as
 * Request-Target, so the value here must match the Notification URL configured
 * in the DOKU Back Office exactly.
 */
export const NOTIFICATION_REQUEST_TARGET = "/api/payments/doku/notification";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is not set.`);
  }
  return value;
}

export function getDokuConfig() {
  const isProduction = process.env.DOKU_ENV === "production";

  return {
    clientId: required("DOKU_CLIENT_ID"),
    secretKey: required("DOKU_SECRET_KEY"),
    baseUrl: isProduction ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL,
    isProduction,
  };
}

/** Registration fee in IDR, without decimals. */
export function getRegistrationFee(): number {
  const raw = process.env.DOKU_REGISTRATION_FEE;
  const amount = Number(raw);

  if (!raw || !Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      "Environment variable DOKU_REGISTRATION_FEE must be a positive integer.",
    );
  }

  return amount;
}

/**
 * Public base URL used to build the callback and notification URLs we hand to
 * DOKU.
 *
 * In development the host is taken from the incoming request, so running the
 * app behind a tunnel (cloudflared, ngrok) just works — DOKU calls back to the
 * tunnel rather than to the production domain, with no .env edit or restart.
 *
 * In production the configured NEXT_PUBLIC_SITE_URL always wins. The Host and
 * X-Forwarded-Host headers are attacker-controlled, so trusting them there
 * would let someone point our payment callbacks at a domain of their choosing.
 */
export function getSiteUrl(request?: Request): string {
  const configured = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(
    /\/+$/,
    "",
  );

  if (process.env.NODE_ENV === "production") return configured;

  const forwarded = request?.headers.get("x-forwarded-host");
  const host = forwarded ?? request?.headers.get("host");
  if (!host) return configured;

  // A tunnel terminates TLS at its edge and forwards plain HTTP to us, so the
  // scheme has to come from the forwarding header rather than the connection.
  const proto =
    request?.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}
