"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Clock } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/overlay/popover";
import { cn } from "@/lib/utils";
import { fieldInputVariants } from "./fields";

const optionVariants = cva(
  [
    "flex h-9 w-14 shrink-0 cursor-pointer items-center justify-center",
    "rounded-lg text-sm tabular-nums transition-colors",
  ],
  {
    variants: {
      selected: {
        true: "bg-brand-600 font-semibold text-white",
        false: "text-ink-700 hover:bg-brand-50",
      },
    },
  },
);

type TimeFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
};

export function TimeField({
  id,
  label,
  required,
  value,
  options,
  onChange,
  error,
}: TimeFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hour, minute] = value ? value.split(":") : ["", ""];
  const hours = [...new Set(options.map((option) => option.split(":")[0]))];
  const minutes = [...new Set(options.map((option) => option.split(":")[1]))];
  const columns = [
    { key: "hour", title: "Jam", items: hours, selected: hour },
    { key: "minute", title: "Menit", items: minutes, selected: minute },
  ] as const;

  function handleSelect(column: "hour" | "minute", item: string) {
    const nextHour = column === "hour" ? item : hour || hours[0];
    const nextMinute = column === "minute" ? item : minute || minutes[0];
    onChange(`${nextHour}:${nextMinute}`);
    if (column === "minute") setIsOpen(false);
  }

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-ink-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          id={id}
          type="button"
          aria-invalid={Boolean(error)}
          className={cn(
            fieldInputVariants({ invalid: Boolean(error) }),
            "flex cursor-pointer items-center justify-between gap-2 text-left",
          )}
        >
          <span className={cn("tabular-nums", !value && "text-ink-500/70")}>
            {value ? value.replace(":", ".") : "Pilih jam"}
          </span>
          <Clock className="h-4 w-4 shrink-0 text-ink-500" aria-hidden="true" />
        </PopoverTrigger>

        <PopoverContent className="w-auto border-brand-200 p-2">
          <div className="flex gap-2">
            {columns.map((column) => (
              <div key={column.key} className="flex flex-col items-center">
                <p className="pb-1.5 text-xs font-medium text-ink-500">
                  {column.title}
                </p>
                <div className="relative flex max-h-56 flex-col gap-1 overflow-y-auto">
                  {column.items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      ref={(node) => {
                        if (node && item === column.selected) {
                          node.parentElement?.scrollTo({
                            top: node.offsetTop - 84,
                          });
                        }
                      }}
                      onClick={() => handleSelect(column.key, item)}
                      className={optionVariants({
                        selected: item === column.selected,
                      })}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
