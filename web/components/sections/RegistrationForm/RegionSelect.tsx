"use client";

import { SearchSelectField } from "./fields";
import type { RegionList } from "@/types/registration/Region";

type RegionSelectProps = {
  id: string;
  label: string;

  value: string;
  regions: RegionList;
  onChange: (name: string, code: string) => void;
  onBlur?: () => void;
  error?: string;
};

export function RegionSelect({
  id,
  label,
  value,
  regions,
  onChange,
  error,
}: RegionSelectProps) {
  const options = regions.regions.map((region) => ({
    value: region.name,
    label: region.name,
  }));

  function handleChange(name: string) {
    const match = regions.regions.find((region) => region.name === name);
    onChange(name, match?.code ?? "");
  }

  return (
    <div className="min-w-0">
      <SearchSelectField
        id={id}
        label={label}
        value={value}
        onChange={handleChange}
        error={error}
        options={options}
        disabled={regions.isDisabled}
      />

      {regions.isLoading && (
        <p className="mt-1 text-[11px] text-ink-500">Memuat data…</p>
      )}

      {regions.loadFailed && (
        <p className="mt-1 text-[11px] text-red-500">
          Gagal memuat data wilayah. Periksa koneksi lalu pilih ulang.
        </p>
      )}
    </div>
  );
}
