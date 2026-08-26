const WILAYAH_BASE_URL = "https://wilayah.id/api";

/**
 * Cache duration for region lookups. The administrative list changes a couple
 * of times a year at most, so caching for a day keeps the form responsive and
 * spares wilayah.id a request per keystroke of the enrolment season.
 */
const CACHE_SECONDS = 60 * 60 * 24;

export type Region = {
  code: string;
  name: string;
};

export type RegionLevel = "provinces" | "regencies" | "districts" | "villages";

export const REGION_LEVELS: RegionLevel[] = [
  "provinces",
  "regencies",
  "districts",
  "villages",
];

/**
 * Fetches one level of the Indonesian administrative hierarchy.
 *
 * `parentCode` is required for every level except provinces: regencies belong
 * to a province, districts to a regency, villages to a district.
 */
export async function listRegions(
  level: RegionLevel,
  parentCode?: string,
): Promise<Region[]> {
  const path =
    level === "provinces"
      ? `${WILAYAH_BASE_URL}/provinces.json`
      : `${WILAYAH_BASE_URL}/${level}/${parentCode}.json`;

  const response = await fetch(path, {
    next: { revalidate: CACHE_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`wilayah.id returned ${response.status} for ${level}`);
  }

  const body = (await response.json()) as { data?: Region[] };

  return (body.data ?? []).map((region) => ({
    code: region.code,
    name: region.name,
  }));
}
