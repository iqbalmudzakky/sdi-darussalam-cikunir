"use client";

import { Check, Landmark, Loader2, PenLine } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import { useAdmissionSettings } from "@/hooks/useAdmissionSettings";
import {
  BANK_FIELDS,
  SIGNER_FIELDS,
} from "@/lib/shared/constant/admissionSettings";
import type { AdmissionSettings } from "@/types/admission/AdmissionSettings";
import {
  ContactCard,
  DiscountCard,
  FeeCard,
  TextCard,
} from "./AdmissionSettingsCards";

type AdmissionSettingsViewProps = {
  initial: AdmissionSettings;
};

export function AdmissionSettingsView({ initial }: AdmissionSettingsViewProps) {
  const state = useAdmissionSettings(initial);
  const saveIcon = state.isSaving ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Check className="h-4 w-4" />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          Pengaturan PMB
        </h1>
        <Button
          type="button"
          onClick={state.save}
          disabled={state.isSaving}
          className="hidden h-10 px-4 sm:inline-flex"
        >
          {saveIcon}
          Simpan
        </Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <FeeCard state={state} />
          <DiscountCard state={state} />
        </div>
        <div className="space-y-4">
          <TextCard
            state={state}
            title="Rekening pembayaran"
            icon={Landmark}
            fields={BANK_FIELDS}
          />
          <TextCard
            state={state}
            title="Penanda tangan"
            icon={PenLine}
            fields={SIGNER_FIELDS}
          />
          <ContactCard state={state} />
        </div>
      </div>

      <Button
        type="button"
        onClick={state.save}
        disabled={state.isSaving}
        className="h-11 w-full sm:hidden"
      >
        {saveIcon}
        Simpan
      </Button>
    </div>
  );
}
