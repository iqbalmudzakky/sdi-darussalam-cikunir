"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminFormSection } from "@/components/admin/shared/AdminFormSection";
import { DateField } from "@/components/sections/RegistrationForm/fields";
import { useToast } from "@/hooks/useToast";
import { savePaymentSettings } from "@/lib/api/paymentSettings";
import { DokuEstimateTable } from "./DokuEstimateTable";
import type { PaymentSettingsResponse } from "@/types/PaymentSettings";

type PaymentSettingsFormProps = {
  settings: PaymentSettingsResponse;
  onSaved: () => Promise<void>;
};

export function PaymentSettingsForm({
  settings,
  onSaved,
}: PaymentSettingsFormProps) {
  const toast = useToast();

  const [fee, setFee] = useState(String(settings.registration_fee));
  const [opensOn, setOpensOn] = useState(settings.registration_opens_on ?? "");
  const [closesOn, setClosesOn] = useState(
    settings.registration_closes_on ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);

  const parsedFee = Number(fee);
  const isValidFee = Number.isInteger(parsedFee) && parsedFee > 0;
  const isValidWindow = !opensOn || !closesOn || closesOn >= opensOn;

  async function handleSave() {
    if (!isValidFee) {
      toast.error(
        "Nominal tidak valid",
        "Isi dengan angka bulat lebih dari 0, tanpa titik atau koma.",
      );
      return;
    }

    if (!isValidWindow) {
      toast.error(
        "Tanggal tidak valid",
        "Tanggal tutup harus sama atau setelah tanggal buka.",
      );
      return;
    }

    setIsSaving(true);
    const input = {
      registrationFee: parsedFee,
      registrationOpensOn: opensOn || null,
      registrationClosesOn: closesOn || null,
    };
    const result = await savePaymentSettings(input);
    setIsSaving(false);

    if (!result.ok) {
      toast.error("Gagal menyimpan", result.error);
      return;
    }

    toast.success(
      "Tersimpan",
      "Pengaturan baru langsung berlaku untuk pendaftaran berikutnya.",
    );
    await onSaved();
  }

  return (
    <div className="space-y-6">
      <AdminFormSection
        title="Biaya Pendaftaran"
        description="Nominal ini yang dibayar pendaftar di halaman pembayaran DOKU."
      >
        <div className="space-y-2">
          <Label htmlFor="registration-fee">Nominal (Rupiah)</Label>

          <Input
            id="registration-fee"
            inputMode="numeric"
            value={fee}
            onChange={(e) => setFee(e.target.value.replace(/\D/g, ""))}
            placeholder="155000"
            className="max-w-xs"
          />

          <p className="text-sm text-gray-500">
            Tulis angka saja, tanpa titik atau koma. Contoh:{" "}
            <span className="font-medium text-gray-700">155000</span> untuk
            Rp155.000.
          </p>
        </div>
      </AdminFormSection>

      <AdminFormSection title="Jadwal Pendaftaran">
        <div className="flex flex-wrap gap-4">
          <div className="max-w-xs">
            <DateField
              id="registration-opens-on"
              label="Tanggal buka"
              value={opensOn}
              onChange={setOpensOn}
            />
          </div>

          <div className="max-w-xs">
            <DateField
              id="registration-closes-on"
              label="Tanggal tutup"
              value={closesOn}
              onChange={setClosesOn}
            />
          </div>
        </div>

        {!isValidWindow && (
          <p className="mt-2 text-sm text-red-600">
            Tanggal tutup harus sama atau setelah tanggal buka.
          </p>
        )}
      </AdminFormSection>

      <AdminFormSection title="Diterima Sekolah jika Bayar via DOKU">
        <DokuEstimateTable estimates={settings.doku_estimates} />
      </AdminFormSection>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !isValidFee || !isValidWindow}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
          {isSaving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
