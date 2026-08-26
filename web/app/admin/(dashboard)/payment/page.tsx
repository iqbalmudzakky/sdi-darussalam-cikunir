"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { useToast } from "@/hooks/useToast";
import { getPaymentSettings, savePaymentSettings } from "@/lib/api/paymentSettings";

/*
 * DOKU memotong MDR dari uang yang masuk, dan nominal dikunci sebelum
 * pendaftar memilih metode bayar. Jadi nominal yang ditagihkan harus sudah
 * menutup metode termahal. Tarif ini dipakai untuk pratinjau saja — yang
 * menagih tetap satu angka di bawah.
 */
const PPN_RATE = 0.11;

const MDR_METHODS = [
  { label: "VA BCA", kind: "flat", value: 4500 },
  { label: "VA bank lain", kind: "flat", value: 4000 },
  { label: "QRIS", kind: "flat", value: 4000 },
  { label: "DANA / OVO / ShopeePay", kind: "percent", value: 0.02 },
] as const;

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function mdrFor(method: (typeof MDR_METHODS)[number], gross: number): number {
  const base = method.kind === "flat" ? method.value : gross * method.value;
  return base * (1 + PPN_RATE);
}

export default function AdminPaymentPage() {
  const toast = useToast();

  const [fee, setFee] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getPaymentSettings()
      .then((settings) => {
        if (!cancelled) setFee(String(settings.registration_fee));
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const parsedFee = Number(fee);
  const isValidFee = Number.isInteger(parsedFee) && parsedFee > 0;

  async function handleSave() {
    if (!isValidFee) {
      toast.error(
        "Nominal tidak valid",
        "Isi dengan angka bulat lebih dari 0, tanpa titik atau koma.",
      );
      return;
    }

    setIsSaving(true);
    const result = await savePaymentSettings(parsedFee);
    setIsSaving(false);

    if (!result.ok) {
      toast.error("Gagal menyimpan", result.error);
      return;
    }

    toast.success(
      "Tersimpan",
      "Nominal baru langsung berlaku untuk pendaftaran berikutnya.",
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-20 text-center text-sm text-gray-500">
        Gagal memuat pengaturan pembayaran. Muat ulang halaman untuk mencoba lagi.
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Pembayaran"
        description="Atur biaya pendaftaran yang ditagihkan ke calon siswa."
      />

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
              <span className="font-medium text-gray-700">155000</span> untuk Rp155.000.
            </p>
          </div>
        </AdminFormSection>

        <AdminFormSection
          title="Perkiraan Diterima Sekolah"
          description="DOKU memotong biaya layanan (MDR) dari uang yang masuk, jadi yang diterima sekolah lebih kecil dari nominal yang ditagihkan. Besarnya berbeda per metode pembayaran."
        >
          {isValidFee ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-md text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-400">
                    <th className="pb-2 font-semibold">Metode</th>
                    <th className="pb-2 text-right font-semibold">Potongan</th>
                    <th className="pb-2 text-right font-semibold">Diterima</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {MDR_METHODS.map((method) => {
                    const mdr = mdrFor(method, parsedFee);

                    return (
                      <tr key={method.label}>
                        <td className="py-2.5 text-gray-700">{method.label}</td>
                        <td className="py-2.5 text-right tabular-nums text-gray-500">
                          &minus;{formatRupiah(mdr)}
                        </td>
                        <td className="py-2.5 text-right font-medium tabular-nums text-gray-900">
                          {formatRupiah(parsedFee - mdr)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <p className="mt-3 text-sm text-gray-500">
                Perkiraan sudah termasuk PPN 11%. Angka pastinya mengikuti tarif
                yang berlaku di perjanjian DOKU.
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Isi nominal yang valid untuk melihat perkiraan.
            </p>
          )}
        </AdminFormSection>

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={isSaving || !isValidFee}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </div>
    </div>
  );
}
