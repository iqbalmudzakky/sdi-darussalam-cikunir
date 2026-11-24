import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/payment/Payment";

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  success: {
    label: "Lunas",
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50 text-green-800",
  },
  pending: {
    label: "Belum Bayar",
    icon: Clock,
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  failed: {
    label: "Gagal Bayar",
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-700",
  },
  expired: {
    label: "Kedaluwarsa",
    icon: XCircle,
    className: "border-gray-200 bg-gray-100 text-gray-600",
  },
  cancelled: {
    label: "Dibatalkan",
    icon: XCircle,
    className: "border-gray-200 bg-gray-100 text-gray-600",
  },
};

type PaymentStatusBadgeProps = {
  status: PaymentStatus | null;
  title?: string;
};

export function PaymentStatusBadge({ status, title }: PaymentStatusBadgeProps) {
  if (!status) return null;

  const meta = PAYMENT_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        meta.className,
      )}
      title={title}
    >
      <meta.icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
