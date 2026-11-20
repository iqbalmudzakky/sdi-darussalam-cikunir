import { cva } from "class-variance-authority";
import { REGISTRATION_STATUS_LABEL } from "@/lib/registrationOptions";
import type { RegistrationStatus } from "@/types/Registration";

const statusBadgeVariants = cva(
  "inline-block shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      status: {
        new: "border-amber-200 bg-amber-50 text-amber-700",
        scheduled: "border-blue-200 bg-blue-50 text-blue-700",
        tested: "border-violet-200 bg-violet-50 text-violet-700",
        accepted: "border-brand-200 bg-brand-50 text-brand-700",
        rejected: "border-red-200 bg-red-50 text-red-700",
        cancelled: "border-gray-200 bg-gray-100 text-gray-500",
      },
    },
  },
);

type RegistrationStatusBadgeProps = {
  status: RegistrationStatus;
};

export function RegistrationStatusBadge({
  status,
}: RegistrationStatusBadgeProps) {
  return (
    <span className={statusBadgeVariants({ status })}>
      {REGISTRATION_STATUS_LABEL[status]}
    </span>
  );
}
