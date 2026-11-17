import { CalendarDays, Wallet } from "lucide-react";
import { AdminFormSection } from "@/components/admin/shared/AdminFormSection";
import { formatDateOnly } from "@/lib/date";
import { formatAmount } from "@/lib/payment";
import { DokuEstimateTable } from "./DokuEstimateTable";
import type { PaymentSettingsResponse } from "@/types/PaymentSettings";

type PaymentSettingsSummaryProps = {
  settings: PaymentSettingsResponse;
};

const iconTileClassName =
  "flex shrink-0 items-center justify-center rounded-[10px] bg-brand-50 text-brand-600";
const dateCardClassName =
  "flex items-center gap-2.5 rounded-[10px] border border-gray-200 bg-white p-3";

export function PaymentSettingsSummary({
  settings,
}: PaymentSettingsSummaryProps) {
  const dates = [
    { label: "Buka", value: settings.registration_opens_on },
    { label: "Tutup", value: settings.registration_closes_on },
  ];

  return (
    <div className="space-y-6">
      <AdminFormSection title="Biaya Pendaftaran">
        <div className="flex items-center gap-3.5">
          <span className={`h-11 w-11 ${iconTileClassName}`}>
            <Wallet className="h-6 w-6" />
          </span>
          <p className="text-[28px] font-semibold text-gray-900 tabular-nums">
            {formatAmount(settings.registration_fee)}
          </p>
        </div>
      </AdminFormSection>

      <AdminFormSection title="Jadwal Pendaftaran">
        <div className="grid grid-cols-2 gap-3">
          {dates.map((date) => (
            <div key={date.label} className={dateCardClassName}>
              <span className={`h-9 w-9 ${iconTileClassName}`}>
                <CalendarDays className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-gray-500">{date.label}</p>
                <p className="text-sm font-semibold text-gray-900">
                  {date.value ? formatDateOnly(date.value) : "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </AdminFormSection>

      <AdminFormSection title="Diterima Sekolah jika Bayar via DOKU">
        <DokuEstimateTable estimates={settings.doku_estimates} />
      </AdminFormSection>
    </div>
  );
}
