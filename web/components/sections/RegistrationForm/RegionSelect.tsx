"use client";

import { useEffect, useState } from "react";
import { SelectField } from "./fields";
import { listRegions } from "@/lib/api/regions";
import type { Region, RegionLevel } from "@/types/Region";

type RegionSelectProps = {
  id: string;
  label: string;
  level: RegionLevel;
  /* Kode wilayah induk; undefined hanya untuk provinsi. */
  parentCode?: string;
  /* Nama wilayah — itu yang disimpan, karena itu yang dicetak di berkas. */
  value: string;
  onChange: (name: string, code: string) => void;
  onBlur?: () => void;
  error?: string;
};

/* Satu tingkat dari provinsi → kabupaten → kecamatan → kelurahan. Nonaktif
 * sampai induknya dipilih, supaya urutannya jelas tanpa perlu petunjuk. */
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

    /* Ditunda satu microtask supaya effect tidak memanggil setState langsung. */
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

  /* Selama induknya belum dipilih, tidak ada pilihan yang bisa ditawarkan. */
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
