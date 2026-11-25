import { cva } from "class-variance-authority";
import { UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { REGISTRATION_SCOPE_OPTIONS } from "@/lib/registrationOptions";
import type { RegistrationListFilters } from "@/types/registration/Registration";

const optionVariants = cva(
  [
    "flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-3.5",
    "text-sm whitespace-nowrap transition-colors sm:flex-none",
  ],
  {
    variants: {
      active: {
        true: "border border-gray-200 bg-white font-semibold text-brand-800",
        false: "font-medium text-gray-500 hover:text-gray-700",
      },
    },
  },
);

type ScopeToggleProps = {
  scope: RegistrationListFilters["scope"];
  className?: string;
  onChange: (scope: RegistrationListFilters["scope"]) => void;
};

export function ScopeToggle({ scope, className, onChange }: ScopeToggleProps) {
  return (
    <div
      role="group"
      aria-label="Tampilkan pendaftar"
      className={cn("gap-1 rounded-xl bg-gray-100 p-1", className)}
    >
      {REGISTRATION_SCOPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={scope === option.value}
          onClick={() => onChange(option.value)}
          className={optionVariants({ active: scope === option.value })}
        >
          {option.value === "mine" && <UserCheck className="h-4 w-4" />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
