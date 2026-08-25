import { NextResponse } from "next/server";
import {
  listRegions,
  REGION_LEVELS,
  type RegionLevel,
} from "@/modules/region/service";

/**
 * Proxies wilayah.id so the browser never talks to it directly. That keeps the
 * upstream host out of our CSP surface, lets Next cache responses across every
 * visitor instead of per browser, and means a change of provider is a one-file
 * edit rather than a client rewrite.
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

  // Provinces are the root of the hierarchy, so any parent sent alongside them
  // is meaningless — ignore it rather than rejecting an otherwise valid call.
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

  // Codes are dotted numerics ("32.75.01"); reject anything else rather than
  // interpolating a caller-supplied string into the upstream URL.
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
