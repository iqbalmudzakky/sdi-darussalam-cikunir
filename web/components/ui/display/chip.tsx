import type { ReactNode } from "react";
import { cva } from "class-variance-authority";

const chipVariants = cva(
  [
    "inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5",
    "text-xs font-semibold whitespace-nowrap",
  ],
  {
    variants: {
      tone: {
        brand: "border-brand-200 bg-brand-50 text-brand-700",
        amber: "border-amber-200 bg-amber-50 text-amber-700",
        red: "border-red-200 bg-red-50 text-red-700",
        gray: "border-gray-200 bg-gray-100 text-gray-600",
      },
    },
  },
);

type ChipProps = {
  tone: "brand" | "amber" | "red" | "gray";
  icon?: ReactNode;
  children: ReactNode;
};

export function Chip({ tone, icon, children }: ChipProps) {
  return (
    <span className={chipVariants({ tone })}>
      {icon}
      {children}
    </span>
  );
}
