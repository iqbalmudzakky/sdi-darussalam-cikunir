import type { useRegions } from "@/hooks/useRegions";

export type Region = {
  code: string;
  name: string;
};

export type RegionLevel = "provinces" | "regencies" | "districts" | "villages";

export type RegionList = ReturnType<typeof useRegions>;
