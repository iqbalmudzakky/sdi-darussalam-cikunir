"use client";

import * as React from "react";
import { DayPicker, type DropdownProps } from "react-day-picker";
import { id as localeId } from "react-day-picker/locale/id";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

function CalendarChevron({
  orientation,
  className,
}: {
  orientation?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  if (orientation === "left") {
    return <ChevronLeft className={cn("h-4 w-4", className)} />;
  }

  if (orientation === "right") {
    return <ChevronRight className={cn("h-4 w-4", className)} />;
  }

  return <ChevronDown className={cn("h-4 w-4", className)} />;
}

function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const items = (options ?? []).map((option) => ({
    value: String(option.value),
    label: option.label,
    disabled: option.disabled,
  }));

  return (
    <Select
      items={items}
      value={value === undefined ? null : String(value)}
      onValueChange={(next) => {
        if (next === null) return;

        /*
         * DayPicker menangani perubahan lewat handler <select> bawaan yang
         * hanya membaca e.target.value, jadi bentuk minimal itu yang dikirim.
         */
        onChange?.({
          target: { value: next },
        } as React.ChangeEvent<HTMLSelectElement>);
      }}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={ariaLabel}
        className="w-auto gap-1 border-brand-200 bg-white px-2.5 text-sm font-medium text-ink-900 hover:border-brand-400"
      >
        <SelectValue />
      </SelectTrigger>

      <SelectContent className="w-auto min-w-32 border-brand-200">
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="data-highlighted:bg-brand-50 data-highlighted:text-brand-900"
          >
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const CALENDAR_CLASS_NAMES = {
  root: "w-fit",
  months: "relative flex flex-col gap-3",
  month: "flex w-full flex-col gap-3",

  nav: "pointer-events-none absolute inset-x-0 top-0 flex h-9 items-center justify-between",
  button_previous:
    "pointer-events-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-brand-50 aria-disabled:pointer-events-none aria-disabled:opacity-30",
  button_next:
    "pointer-events-auto inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-brand-50 aria-disabled:pointer-events-none aria-disabled:opacity-30",

  month_caption: "flex h-9 items-center justify-center",
  dropdowns: "flex items-center gap-2",

  caption_label: "text-sm font-medium text-ink-900",

  month_grid: "w-full border-collapse",
  weekdays: "flex",
  weekday: "w-9 text-[11px] font-medium text-ink-500",
  week: "mt-1 flex w-full",

  day: "h-9 w-9 p-0 text-center",
  day_button:
    "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-sm text-ink-900 transition-colors hover:bg-brand-50",

  selected:
    "[&>button]:bg-brand-600 [&>button]:font-medium [&>button]:text-white [&>button:hover]:bg-brand-700",
  today: "[&>button]:font-semibold [&>button]:text-brand-700",
  outside: "[&>button]:text-ink-500/40",
  disabled: "[&>button]:pointer-events-none [&>button]:text-ink-500/30",
} as const;

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={localeId}
      className={cn("p-3", className)}
      classNames={{ ...CALENDAR_CLASS_NAMES, ...classNames }}
      components={{ Chevron: CalendarChevron, Dropdown: CalendarDropdown }}
      {...props}
    />
  );
}
