"use client";

import { useEffect, useState } from "react";
import { listRegions } from "@/lib/api/registration/regions";
import type { Region, RegionLevel } from "@/types/registration/Region";

export function useRegions(
  level: RegionLevel,
  parentCode: string | undefined,
  selectedName: string,
) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const isDisabled = level !== "provinces" && !parentCode;

  useEffect(() => {
    if (isDisabled) return;
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadFailed(false);

      try {
        const result = await listRegions(level, parentCode);
        if (!cancelled) setRegions(result);
      } catch (error) {
        if (cancelled) return;
        console.error(`Failed to load ${level}:`, error);
        setLoadFailed(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [level, parentCode, isDisabled]);

  const options = isDisabled ? [] : regions;
  const selectedCode = options.find(
    (region) => region.name === selectedName,
  )?.code;
  const result = {
    regions: options,
    selectedCode,
    isLoading,
    loadFailed,
    isDisabled,
  };
  return result;
}
