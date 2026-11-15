import { existsSync, statSync } from "fs";
import { open, validate, type Reader, type Response } from "maxmind";

/*
 * Perkiraan lokasi pengunjung dari alamat IP memakai basis data DB-IP City
 * Lite (CC BY 4.0, terbit bulanan). Berkasnya ada di luar image, di jalur
 * GEOIP_DATABASE, supaya bisa diperbarui tanpa deploy.
 *
 * Internet seluler sering terbaca Jakarta walau pengunjung berada di daerah
 * lain, jadi angka ini perkiraan, bukan kepastian.
 */

export type VisitorLocation = {
  country_code: string | null;
  province: string | null;
  city: string | null;
};

const EMPTY: VisitorLocation = {
  country_code: null,
  province: null,
  city: null,
};

/* Nama provinsi DB-IP (bahasa Inggris, huruf kecil) ke nama Indonesia. */
const PROVINCES: Record<string, string> = {
  jakarta: "DKI Jakarta",
  banten: "Banten",
  "west java": "Jawa Barat",
  "central java": "Jawa Tengah",
  yogyakarta: "DI Yogyakarta",
  "special region of yogyakarta": "DI Yogyakarta",
  "east java": "Jawa Timur",
  aceh: "Aceh",
  "north sumatra": "Sumatera Utara",
  "west sumatra": "Sumatera Barat",
  riau: "Riau",
  "riau islands": "Kepulauan Riau",
  jambi: "Jambi",
  bengkulu: "Bengkulu",
  "south sumatra": "Sumatera Selatan",
  "bangka-belitung islands": "Kepulauan Bangka Belitung",
  lampung: "Lampung",
  "west kalimantan": "Kalimantan Barat",
  "central kalimantan": "Kalimantan Tengah",
  "south kalimantan": "Kalimantan Selatan",
  "east kalimantan": "Kalimantan Timur",
  "north kalimantan": "Kalimantan Utara",
  "north sulawesi": "Sulawesi Utara",
  gorontalo: "Gorontalo",
  "central sulawesi": "Sulawesi Tengah",
  "west sulawesi": "Sulawesi Barat",
  "south sulawesi": "Sulawesi Selatan",
  "southeast sulawesi": "Sulawesi Tenggara",
  bali: "Bali",
  "west nusa tenggara": "Nusa Tenggara Barat",
  "east nusa tenggara": "Nusa Tenggara Timur",
  maluku: "Maluku",
  "north maluku": "Maluku Utara",
  papua: "Papua",
  "west papua": "Papua Barat",
  "southwest papua": "Papua Barat Daya",
  "central papua": "Papua Tengah",
  "highland papua": "Papua Pegunungan",
  "south papua": "Papua Selatan",
};

/* Bentuk catatan DB-IP City Lite yang dipakai di sini. */
export type GeoRecord = {
  country?: { iso_code?: string; names?: { en?: string } };
  subdivisions?: { names?: { en?: string } }[];
  city?: { names?: { en?: string } };
};

function normalizeProvince(name: string): string {
  return name
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function databasePath(): string {
  return process.env.GEOIP_DATABASE ?? "";
}

export function isLocationAvailable(): boolean {
  const path = databasePath();

  return path !== "" && existsSync(path);
}

/* Mengubah catatan mentah DB-IP menjadi lokasi berbahasa Indonesia. */
export function locationFromRecord(
  record: GeoRecord | null | undefined,
): VisitorLocation {
  const country = record?.country?.iso_code;
  if (!country) return EMPTY;

  const region = record.subdivisions?.[0]?.names?.en ?? null;
  const city = record.city?.names?.en ?? null;

  /* Di luar Indonesia nama negaranya dipakai sebagai "provinsi". */
  if (country !== "ID") {
    return {
      country_code: country,
      province: record.country?.names?.en ?? country,
      city,
    };
  }

  return {
    country_code: "ID",
    province: region
      ? (PROVINCES[normalizeProvince(region)] ?? region)
      : null,
    city,
  };
}

type GeoReader = Reader<GeoRecord & Response>;

/* Berkas dicek ulang paling sering tiap 10 menit, supaya pembaruan bulanan terbaca tanpa restart. */
const RECHECK_MS = 10 * 60_000;

let reader: GeoReader | null = null;
let readerPath = "";
let readerModifiedMs = 0;
let checkedAt = 0;

/*
 * Pembaca dibuka sekali lalu dipakai ulang: berkasnya ratusan megabita dan
 * dimuat utuh ke memori. Dibuka ulang hanya bila berkasnya berganti.
 */
async function getReader(): Promise<GeoReader | null> {
  const path = databasePath();
  if (!path) return null;

  const now = Date.now();
  if (reader && readerPath === path && now - checkedAt < RECHECK_MS) {
    return reader;
  }

  checkedAt = now;

  let modifiedMs: number;
  try {
    modifiedMs = statSync(path).mtimeMs;
  } catch {
    reader = null;
    return null;
  }

  if (!reader || readerPath !== path || readerModifiedMs !== modifiedMs) {
    reader = await open<GeoRecord & Response>(path);
    readerPath = path;
    readerModifiedMs = modifiedMs;
  }

  return reader;
}

/*
 * Kegagalan membaca lokasi tidak boleh menggagalkan pencatatan kunjungan,
 * jadi apa pun masalahnya hasilnya lokasi kosong.
 */
export async function lookupLocation(ip: string): Promise<VisitorLocation> {
  if (!validate(ip)) return EMPTY;

  try {
    const geoReader = await getReader();

    return locationFromRecord(geoReader?.get(ip));
  } catch (error) {
    console.error("visitor.lookupLocation failed:", error);

    return EMPTY;
  }
}
