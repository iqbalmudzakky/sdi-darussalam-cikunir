import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentStatus } from "@/types/Payment";

/* Semua status yang bisa dibaca dari database, dipakai untuk menampilkan. */
export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  success: {
    label: "Lunas",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  pending: {
    label: "Belum Bayar",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  failed: {
    label: "Gagal Bayar",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
  expired: {
    label: "Kedaluwarsa",
    icon: XCircle,
    className: "bg-gray-100 text-gray-600",
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
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        meta.className,
      )}
      title={title}
    >
      <meta.icon className="h-3 w-3" />
      {meta.label}
    </span>
  );
}
