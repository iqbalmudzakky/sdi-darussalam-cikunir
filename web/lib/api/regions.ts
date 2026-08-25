import type { Region, RegionLevel } from "@/types/Region";

export async function listRegions(
  level: RegionLevel,
  parentCode?: string,
): Promise<Region[]> {
  const query = parentCode ? `?parent=${encodeURIComponent(parentCode)}` : "";
  const res = await fetch(`/api/regions/${level}${query}`);
  if (!res.ok) throw new Error(`Failed to load ${level} (${res.status})`);
  return res.json();
}
