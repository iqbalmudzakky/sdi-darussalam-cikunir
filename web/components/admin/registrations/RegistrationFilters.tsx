import { cva } from "class-variance-authority";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  REGISTRATION_JENIS_OPTIONS,
  REGISTRATION_PROGRAM_OPTIONS,
  REGISTRATION_STATUS_OPTIONS,
} from "@/lib/registrationOptions";
import type {
  RegistrationListFilters,
  RegistrationProgram,
  RegistrationStatus,
  RegistrationType,
} from "@/types/registration/Registration";

const filterItemVariants = cva([
  "py-2 whitespace-nowrap text-gray-700",
  "data-selected:bg-brand-50 data-selected:font-semibold data-selected:text-brand-800",
]);

type RegistrationFiltersProps = {
  searchInput: string;
  isRefreshing: boolean;
  filters: RegistrationListFilters;
  academicYears: string[];
  onSearchChange: (value: string) => void;
  onFiltersChange: (patch: Partial<RegistrationListFilters>) => void;
};

export function RegistrationFilters({
  searchInput,
  isRefreshing,
  filters,
  academicYears,
  onSearchChange,
  onFiltersChange,
}: RegistrationFiltersProps) {
  const academicYearOptions = academicYears.map((year) => ({
    value: year,
    label: year,
  }));

  function handleStatusChange(value: string) {
    const patch = { status: value as RegistrationStatus | "" };
    onFiltersChange(patch);
  }

  function handleAcademicYearChange(value: string) {
    const patch = { academicYear: value };
    onFiltersChange(patch);
  }

  function handleProgramChange(value: string) {
    const patch = { program: value as RegistrationProgram | "" };
    onFiltersChange(patch);
  }

  function handleTypeChange(value: string) {
    const patch = { registrationType: value as RegistrationType | "" };
    onFiltersChange(patch);
  }

  return (
    <div className="mb-4 flex flex-col gap-2 xl:flex-row">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="search"
          value={searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Cari nama atau nomor"
          aria-label="Cari nama atau nomor"
          className="h-9 bg-white pr-9 pl-9"
        />
        {isRefreshing && (
          <Loader2 className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:w-156">
        <FilterSelect
          label="Status"
          value={filters.status}
          options={REGISTRATION_STATUS_OPTIONS}
          onChange={handleStatusChange}
        />
        <FilterSelect
          label="Tahun masuk"
          value={filters.academicYear}
          options={academicYearOptions}
          onChange={handleAcademicYearChange}
        />
        <FilterSelect
          label="Program"
          value={filters.program}
          options={REGISTRATION_PROGRAM_OPTIONS}
          onChange={handleProgramChange}
        />
        <FilterSelect
          label="Jenis"
          value={filters.registrationType}
          options={REGISTRATION_JENIS_OPTIONS}
          onChange={handleTypeChange}
        />
      </div>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
};

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  const allValue = "all";
  const items = [{ value: allValue, label: "Semua" }, ...options];

  return (
    <Select
      items={items}
      value={value || allValue}
      onValueChange={(next) => onChange(!next || next === allValue ? "" : next)}
    >
      <SelectTrigger
        aria-label={label}
        className="h-9 bg-white font-medium text-gray-700"
      >
        <SelectValue className="truncate">
          {(selected: string) =>
            items.find(
              (item) => item.value === selected && selected !== allValue,
            )?.label ?? label
          }
        </SelectValue>
      </SelectTrigger>

      <SelectContent className="w-max min-w-(--anchor-width)">
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className={filterItemVariants()}
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
