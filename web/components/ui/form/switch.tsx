"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "@base-ui/react/switch";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const switchVariants = cva([
  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-transparent bg-gray-200 outline-none transition-colors",
  "data-checked:bg-brand-600",
  "focus-visible:ring-3 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-50",
]);

const switchThumbVariants = cva([
  "block h-4 w-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform",
  "data-checked:translate-x-4",
]);

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(switchVariants(), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={switchThumbVariants()}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
