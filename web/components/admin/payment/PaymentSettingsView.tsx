"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReadOnlyChip } from "@/components/admin/shared/ReadOnlyChip";
import { getPaymentSettings } from "@/lib/api/payment/paymentSettings";
import { PaymentSettingsForm } from "./PaymentSettingsForm";
import { PaymentSettingsSummary } from "./PaymentSettingsSummary";
import type { PaymentSettingsResponse } from "@/types/payment/PaymentSettings";

export function PaymentSettingsView() {
  const [settings, setSettings] = useState<PaymentSettingsResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await getPaymentSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load payment settings:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await loadSettings();
    };

    load();
  }, [loadSettings]);

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Pembayaran"
        action={settings && !settings.can_manage ? <ReadOnlyChip /> : undefined}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : loadError || !settings ? (
        <div className="py-20 text-center text-sm text-gray-500">
          Gagal memuat pengaturan pembayaran. Muat ulang halaman untuk mencoba
          lagi.
        </div>
      ) : settings.can_manage ? (
        <PaymentSettingsForm
          key={settings.updated_at}
          settings={settings}
          onSaved={loadSettings}
        />
      ) : (
        <PaymentSettingsSummary settings={settings} />
      )}
    </div>
  );
}
