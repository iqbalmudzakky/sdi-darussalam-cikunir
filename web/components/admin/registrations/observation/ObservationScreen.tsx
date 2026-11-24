"use client";

import { useState } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { ArrowLeft, ArrowRight, Check, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import { useObservation } from "@/hooks/useObservation";
import type { ObservationView } from "@/types/registration/Registration";
import { DimensionCard } from "./DimensionCard";
import { ObservationGuideDialog } from "./ObservationGuideDialog";
import { ObservationHeader } from "./ObservationHeader";
import { ReadinessProfile } from "./ReadinessProfile";

const stepChipVariants = cva(
  [
    "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium",
    "whitespace-nowrap transition-colors disabled:cursor-wait",
  ],
  {
    variants: {
      active: {
        true: "border-brand-600 bg-brand-600 text-white",
        false: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      },
    },
  },
);

type ObservationScreenProps = {
  initial: ObservationView;
  showProfile: boolean;
};

export function ObservationScreen({
  initial,
  showProfile,
}: ObservationScreenProps) {
  const initialStep = showProfile ? initial.dimensions.length : 0;
  const observation = useObservation(initial, initialStep);
  const { view, step, profileStep, isSaving } = observation;
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const isProfile = step === profileStep;
  const dimension = view.dimensions[step];
  const previousStep = step - 1;
  const nextStep = step + 1;
  const saveIcon = isSaving ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Check className="h-4 w-4" />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <Link
        href={`/registrations/${view.registration_id}`}
        className="flex w-fit items-center gap-2.5 font-semibold text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 text-gray-700" />
        Pendaftar
      </Link>

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
          {isProfile ? "Profil Kesiapan" : "Observasi Kesiapan"}
        </h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsGuideOpen(true)}
          className="h-10"
        >
          <Info className="h-4 w-4" />
          Petunjuk
        </Button>
      </div>

      {isProfile ? (
        <>
          <ReadinessProfile
            view={view}
            recommendation={observation.recommendation}
            onRecommendationChange={observation.changeRecommendation}
          />
          <div className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => observation.goToStep(previousStep)}
              disabled={isSaving}
              aria-label="Kembali ke observasi"
              className="h-11 w-11"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {view.can_edit && (
              <Button
                type="button"
                onClick={observation.complete}
                disabled={isSaving || !observation.canComplete}
                className="h-11 flex-1 sm:flex-none sm:px-5"
              >
                {saveIcon}
                Simpan observasi
              </Button>
            )}
          </div>
        </>
      ) : (
        <>
          <ObservationHeader
            view={view}
            note={observation.note}
            onNoteChange={observation.changeNote}
          />

          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {view.dimensions.map((item, index) => (
              <button
                key={item.name}
                type="button"
                disabled={isSaving}
                onClick={() => observation.goToStep(index)}
                className={stepChipVariants({ active: index === step })}
              >
                {index + 1}. {item.name}
              </button>
            ))}
          </div>

          <DimensionCard
            dimension={dimension}
            entries={observation.entries}
            openNotes={observation.openNotes}
            canEdit={view.can_edit}
            onChange={observation.updateEntry}
            onToggleNote={observation.toggleNote}
          />

          <div className="flex items-center justify-between gap-3">
            <span className="hidden text-sm text-gray-500 sm:inline">
              Dimensi {step + 1} dari {profileStep}
            </span>
            <Button
              type="button"
              onClick={() => observation.goToStep(nextStep)}
              disabled={isSaving}
              className="h-11 w-full sm:w-auto sm:px-5"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Berikutnya
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}

      <ObservationGuideDialog
        open={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
