/* Dibaca di dalam fungsi supaya variabel yang hilang muncul sebagai error
 * pada request yang membutuhkannya, bukan menggagalkan build. */

const SANDBOX_BASE_URL = "https://api-sandbox.doku.com";
const PRODUCTION_BASE_URL = "https://api.doku.com";

/* Path endpoint Checkout, sekaligus Request-Target yang ditandatangani. */
export const CHECKOUT_REQUEST_TARGET = "/checkout/v1/payment";

/* Harus sama persis dengan Notification URL di DOKU Back Office: nilai ini
 * ikut ditandatangani. */
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

/*
 * Saat development host diambil dari request, supaya tunnel langsung jalan
 * tanpa mengubah .env. Di produksi selalu memakai NEXT_PUBLIC_SITE_URL, karena
 * header Host bisa dipalsukan pengirim request.
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

  /* Tunnel meneruskan HTTP biasa, jadi skema diambil dari header. */
  const proto =
    request?.headers.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return `${proto}://${host}`;
}
