"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { Check, ClipboardCheck, Pencil } from "lucide-react";
import { Chip } from "@/components/ui/display/chip";
import { ProgressBar } from "@/components/ui/display/progress-bar";
import { Button } from "@/components/ui/form/button";
import { formatNumericDateOnly } from "@/lib/date";
import type {
  RegistrationDetail,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";
import { ManualResultDialog } from "./ManualResultDialog";

const cardVariants = cva(
  "space-y-3.5 rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const dataRowVariants = cva([
  "flex items-baseline justify-between gap-4 border-b border-gray-100 py-2",
  "text-sm last:border-b-0 last:pb-0",
]);

type TestResultCardProps = {
  registration: RegistrationDetail;
  isSaving: boolean;
  onSave: (input: UpdateRegistrationInput) => Promise<boolean>;
};

export function TestResultCard({
  registration,
  isSaving,
  onSave,
}: TestResultCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isManual = registration.registration_type === "pindahan";
  const isTested = registration.test_status === "tested";
  const manual = registration.schedule?.manual_result ?? null;
  const observation = isTested ? registration.observation : null;
  const canStart = registration.can_start_test;
  const observationHref = `/registrations/${registration.id}/observation`;

  async function handleSave(input: UpdateRegistrationInput) {
    const saved = await onSave(input);
    if (saved) setIsDialogOpen(false);
  }

  return (
    <section className={cardVariants()}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <ClipboardCheck className="h-4 w-4" />
        </span>
        <h2 className="flex-1 text-sm font-semibold text-gray-900">
          Hasil tes
        </h2>
        {!isTested && <Chip tone="gray">Belum dites</Chip>}
        {observation?.conclusion && (
          <Chip
            tone={observation.conclusion.tone}
            icon={<Check className="h-3 w-3" />}
          >
            {observation.conclusion.label}
          </Chip>
        )}
        {manual && (
          <Chip tone="brand" icon={<Check className="h-3 w-3" />}>
            Sudah tes
          </Chip>
        )}
        {registration.can_edit_test && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            aria-label="Ubah hasil tes"
            title="Ubah hasil tes"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {canStart && !isManual && (
        <Button
          nativeButton={false}
          render={<Link href={observationHref} />}
          className="h-11 w-full sm:w-auto sm:px-4"
        >
          <ClipboardCheck className="h-4 w-4" />
          {registration.test_status === "in_progress"
            ? "Lanjutkan observasi"
            : "Isi observasi"}
        </Button>
      )}

      {canStart && isManual && (
        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          className="h-11 w-full sm:w-auto sm:px-4"
        >
          <ClipboardCheck className="h-4 w-4" />
          Isi hasil tes
        </Button>
      )}

      {observation && (
        <>
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-lg font-bold text-gray-900 tabular-nums">
              {observation.score_label}
            </span>
            <div className="w-full max-w-xs">
              <ProgressBar
                ratio={observation.ratio}
                tone={observation.conclusion?.tone}
              />
            </div>
          </div>
          <div>
            <DataRow label="Observer" value={observation.observer_name} />
            <DataRow
              label="Tanggal Observasi"
              value={
                observation.observed_on &&
                formatNumericDateOnly(observation.observed_on)
              }
            />
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`${observationHref}?step=profile`} />}
            className="h-11 w-full"
          >
            <ClipboardCheck className="h-4 w-4" />
            Lihat Profil Kesiapan
          </Button>
        </>
      )}

      {manual && (
        <div>
          <DataRow
            label="Tanggal tes"
            value={formatNumericDateOnly(manual.tested_on)}
          />
          {manual.notes && (
            <p className="pt-2 text-sm whitespace-pre-line text-gray-800">
              {manual.notes}
            </p>
          )}
        </div>
      )}

      <ManualResultDialog
        open={isDialogOpen}
        result={manual}
        defaultDate={registration.schedule?.test_date ?? null}
        isSaving={isSaving}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={dataRowVariants()}>
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 text-right font-semibold break-words text-gray-900">
        {value || "-"}
      </span>
    </div>
  );
}
