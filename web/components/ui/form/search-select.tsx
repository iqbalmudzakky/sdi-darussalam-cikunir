"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cva } from "class-variance-authority";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const popupVariants = cva([
  "w-max min-w-(--anchor-width) max-w-[min(22rem,calc(100vw-2rem))]",
  "overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg",
  "outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
]);

const searchBoxVariants = cva([
  "flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50",
  "px-3 text-gray-500",
]);

const listVariants = cva([
  "mt-1 max-h-[min(var(--available-height),18rem)] overflow-y-auto",
]);

const itemVariants = cva([
  "flex cursor-default items-center gap-2 rounded-lg py-2 pr-3 pl-2 text-sm",
  "text-gray-700 outline-none select-none",
  "data-highlighted:bg-brand-50 data-selected:bg-brand-50",
  "data-selected:font-semibold data-selected:text-brand-800",
]);

export type SearchSelectOption = {
  value: string;
  label: string;
  icon?: React.ReactNode;
  triggerLabel?: string;
};

type SearchSelectProps = {
  id: string;
  value: string;
  options: SearchSelectOption[];
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
};

export function SearchSelect({
  id,
  value,
  options,
  onValueChange,
  placeholder = "Pilih",
  searchPlaceholder = "Cari",
  disabled,
  invalid,
  className,
}: SearchSelectProps) {
  const selected = options.find((option) => option.value === value) ?? null;

  return (
    <ComboboxPrimitive.Root<SearchSelectOption>
      items={options}
      value={selected}
      onValueChange={(next) => onValueChange(next?.value ?? "")}
      itemToStringLabel={(option) => option.label}
      isItemEqualToValue={(option, current) => option.value === current.value}
      disabled={disabled}
    >
      <ComboboxPrimitive.Trigger
        id={id}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${id}-error` : undefined}
        className={cn(
          "flex cursor-pointer items-center justify-between gap-2 text-left",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className,
        )}
      >
        <span
          className={cn(
            "flex min-w-0 items-center gap-2 truncate",
            !selected && "text-ink-500/70",
          )}
        >
          {selected?.icon}
          {selected ? (selected.triggerLabel ?? selected.label) : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </ComboboxPrimitive.Trigger>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner
          sideOffset={6}
          align="start"
          className="z-50 outline-none"
        >
          <ComboboxPrimitive.Popup className={popupVariants()}>
            <div className={searchBoxVariants()}>
              <Search className="h-4 w-4 shrink-0" />
              <ComboboxPrimitive.Input
                placeholder={searchPlaceholder}
                className="h-full w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none"
              />
            </div>
            <ComboboxPrimitive.Empty className="px-3 py-5 text-center text-sm text-gray-400">
              Tidak ditemukan
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className={listVariants()}>
              {(option: SearchSelectOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  className={itemVariants()}
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    <ComboboxPrimitive.ItemIndicator>
                      <Check className="h-4 w-4 text-brand-600" />
                    </ComboboxPrimitive.ItemIndicator>
                  </span>
                  {option.icon}
                  {option.label}
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  );
}
