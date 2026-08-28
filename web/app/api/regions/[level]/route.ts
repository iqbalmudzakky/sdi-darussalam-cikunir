import { NextResponse } from "next/server";
import {
  listRegions,
  REGION_LEVELS,
  type RegionLevel,
} from "@/modules/region/service";

/*
 * Memproksi wilayah.id supaya respons bisa di-cache untuk semua pengunjung
 * sekaligus, dan mengganti penyedia cukup mengubah satu file.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ level: string }> },
) {
  const { level } = await params;

  if (!REGION_LEVELS.includes(level as RegionLevel)) {
    return NextResponse.json(
      { error: "Level wilayah tidak dikenal." },
      { status: 400 },
    );
  }

  /* Provinsi adalah akar, jadi parent yang ikut terkirim diabaikan saja. */
  const parentCode =
    level === "provinces"
      ? null
      : new URL(request.url).searchParams.get("parent");

  if (level !== "provinces" && !parentCode) {
    return NextResponse.json(
      { error: "Parameter parent wajib diisi." },
      { status: 400 },
    );
  }

  /* Kode selalu angka bertitik; selain itu ditolak agar tidak masuk URL. */
  if (parentCode && !/^[0-9]{2}(\.[0-9]{2}){0,2}$/.test(parentCode)) {
    return NextResponse.json(
      { error: "Kode wilayah tidak valid." },
      { status: 400 },
    );
  }

  try {
    const regions = await listRegions(
      level as RegionLevel,
      parentCode ?? undefined,
    );
    return NextResponse.json(regions);
  } catch (error) {
    console.error(`GET /api/regions/${level} failed:`, error);
    return NextResponse.json(
      { error: "Gagal memuat data wilayah." },
      { status: 502 },
    );
  }
}
