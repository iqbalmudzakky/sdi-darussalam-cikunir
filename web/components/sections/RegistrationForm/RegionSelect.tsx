"use client";

import { useEffect, useState } from "react";
import { SelectField } from "./fields";
import { listRegions } from "@/lib/api/regions";
import type { Region, RegionLevel } from "@/types/Region";

type RegionSelectProps = {
  id: string;
  label: string;
  level: RegionLevel;
  /** Code of the selected parent region; undefined only for provinces. */
  parentCode?: string;
  /** The selected region's name — what we store, since that is what forms print. */
  value: string;
  onChange: (name: string, code: string) => void;
  onBlur?: () => void;
  error?: string;
};

/**
 * One level of the province → regency → district → village cascade.
 *
 * The list reloads whenever the parent changes, and the control disables
 * itself until a parent is chosen so the order of selection is obvious
 * without needing instructions.
 */
export function RegionSelect({
  id,
  label,
  level,
  parentCode,
  value,
  onChange,
  onBlur,
  error,
}: RegionSelectProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  const needsParent = level !== "provinces";
  const isDisabled = needsParent && !parentCode;

  useEffect(() => {
    if (isDisabled) return;

    let cancelled = false;

    // Kicked off in a microtask so the effect body itself does not call
    // setState synchronously, which would cascade an extra render.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      setIsLoading(true);
      setLoadFailed(false);
    });

    listRegions(level, parentCode)
      .then((result) => {
        if (!cancelled) setRegions(result);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [level, parentCode, isDisabled]);

  // While no parent is chosen there is nothing to offer; deriving this rather
  // than clearing state in the effect keeps the render pure.
  const options = (isDisabled ? [] : regions).map((region) => ({
    value: region.name,
    label: region.name,
  }));

  function handleChange(name: string) {
    const match = regions.find((region) => region.name === name);
    onChange(name, match?.code ?? "");
  }

  return (
    <div className="min-w-0">
      <SelectField
        id={id}
        label={label}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        error={error}
        options={options}
      />

      {isLoading && (
        <p className="mt-1 text-[11px] text-ink-500">Memuat data…</p>
      )}

      {loadFailed && (
        <p className="mt-1 text-[11px] text-red-500">
          Gagal memuat data wilayah. Periksa koneksi lalu pilih ulang.
        </p>
      )}
    </div>
  );
}
