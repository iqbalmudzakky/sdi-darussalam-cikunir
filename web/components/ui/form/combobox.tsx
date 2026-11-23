"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { cva } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Combobox<Value>(
  props: React.ComponentProps<typeof ComboboxPrimitive.Root<Value>>,
) {
  return <ComboboxPrimitive.Root data-slot="combobox" {...props} />;
}

const comboboxInputGroupVariants = cva([
  "flex h-8 w-full min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 outline-none transition-colors",
  "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
]);

function ComboboxInputGroup({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.InputGroup>) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={cn(comboboxInputGroupVariants(), className)}
      {...props}
    />
  );
}

const comboboxInputVariants = cva([
  "h-8 w-full min-w-0 bg-transparent text-base outline-none",
  "placeholder:text-gray-400",
  "md:text-sm",
]);

function ComboboxInput({
  className,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Input>) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(comboboxInputVariants(), className)}
      {...props}
    />
  );
}

function ComboboxTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Trigger>) {
  return (
    <ComboboxPrimitive.Trigger
      data-slot="combobox-trigger"
      className={cn("shrink-0 outline-none", className)}
      {...props}
    >
      {children ?? (
        <ComboboxPrimitive.Icon>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </ComboboxPrimitive.Icon>
      )}
    </ComboboxPrimitive.Trigger>
  );
}

const comboboxContentVariants = cva([
  "w-[var(--anchor-width)] min-w-32 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg outline-none",
  "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
  "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
]);

const comboboxListVariants = cva([
  "max-h-[var(--available-height)] overflow-y-auto p-1",
]);

const comboboxEmptyVariants = cva([
  "px-3 py-6 text-center text-sm text-gray-400",
]);

function ComboboxContent({
  className,
  children,
  sideOffset = 6,
  emptyMessage = "Tidak ditemukan.",
}: {
  className?: string;
  children?: React.ReactNode | ((item: any, index: number) => React.ReactNode);
  sideOffset?: number;
  emptyMessage?: React.ReactNode;
}) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Backdrop />
      <ComboboxPrimitive.Positioner
        sideOffset={sideOffset}
        className="z-50 outline-none"
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(comboboxContentVariants(), className)}
        >
          <ComboboxPrimitive.Empty className={comboboxEmptyVariants()}>
            {emptyMessage}
          </ComboboxPrimitive.Empty>
          <ComboboxPrimitive.List
            data-slot="combobox-list"
            className={comboboxListVariants()}
          >
            {children}
          </ComboboxPrimitive.List>
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

const comboboxItemVariants = cva([
  "relative flex cursor-default select-none items-center gap-2 rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none",
  "data-highlighted:bg-brand-50 data-highlighted:text-emerald-900",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
]);

function ComboboxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ComboboxPrimitive.Item>) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(comboboxItemVariants(), className)}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <ComboboxPrimitive.ItemIndicator>
          <Check className="w-4 h-4 text-brand-600" />
        </ComboboxPrimitive.ItemIndicator>
      </span>
      {children}
    </ComboboxPrimitive.Item>
  );
}

export {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxContent,
  ComboboxItem,
};
