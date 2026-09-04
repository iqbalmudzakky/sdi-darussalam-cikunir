import type { Payment } from "@/types/Payment";

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatMethod(method: string | null): string {
  if (!method) return "—";
  return method.replace(/_/g, " ").toLowerCase();
}

export function isOrphaned(payment: Payment): boolean {
  return payment.status === "success" && !payment.is_settled;
}
