import { formatAmount } from "@/lib/payment";
import type { DokuEstimate } from "@/types/payment/PaymentSettings";

type DokuEstimateTableProps = {
  estimates: DokuEstimate[];
};

export function DokuEstimateTable({ estimates }: DokuEstimateTableProps) {
  return (
    <ul className="divide-y divide-gray-100">
      {estimates.map((estimate) => (
        <li
          key={estimate.method}
          className="flex items-center gap-3 py-2.5 text-sm"
        >
          <span className="flex-1 text-gray-700">{estimate.method}</span>
          <span className="text-[13px] text-gray-400 tabular-nums">
            &minus;{formatAmount(estimate.deduction)}
          </span>
          <span className="font-semibold text-gray-900 tabular-nums">
            {formatAmount(estimate.received)}
          </span>
        </li>
      ))}
    </ul>
  );
}
