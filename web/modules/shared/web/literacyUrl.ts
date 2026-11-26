/** Situs literasi sekolah, proyek terpisah dari web PMB. */
const LITERACY_SITE_URL = "https://literasi.sdidarussalamcikunir.sch.id";

/**
 * Alamat situs literasi untuk menu Literasi dan pengalihan /literasi.
 *
 * NEXT_PUBLIC_LITERACY_URL diisi bila alamatnya berbeda. Variabel NEXT_PUBLIC
 * ditanam saat build, sedangkan image PMB dibangun tanpa variabel itu, jadi
 * staging dan produksi memakai alamat situs literasi yang sudah terbit.
 * Saat development, bawaannya server literasi lokal.
 */
export function getLiteracySiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_LITERACY_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return process.env.NODE_ENV === "development"
    ? "http://localhost:3092"
    : LITERACY_SITE_URL;
}
