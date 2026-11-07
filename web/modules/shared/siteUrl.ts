/*
 * Satu-satunya tempat alamat situs ditentukan.
 *
 * SITE_URL sengaja BUKAN NEXT_PUBLIC_: variabel NEXT_PUBLIC_ ditanam ke dalam
 * hasil build, sehingga satu image tidak bisa dipakai untuk staging maupun
 * production. Nilai ini hanya dibaca di server (metadata, sitemap, robots,
 * tautan di email), jadi tidak perlu sampai ke browser.
 */

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function getSiteUrl(): string {
  /* NEXT_PUBLIC_SITE_URL masih dibaca selama produksi belum pindah dari Vercel. */
  const configured = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (configured && isValidUrl(configured)) {
    return configured.replace(/\/+$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    /* Bukan error: halaman tetap tampil, hanya tautan absolutnya salah. Tapi
       harus terlihat di log, karena gejalanya muncul jauh di tempat lain —
       tautan reset sandi di email, kartu WhatsApp, dan sitemap. */
    console.error(
      "[site] SITE_URL is not set or invalid; falling back to localhost.",
    );
  }

  return "http://localhost:3000";
}

export function buildAdminUrl(path: string): string {
  return `${getSiteUrl()}${path}`;
}
