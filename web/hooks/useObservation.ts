"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { saveObservation } from "@/lib/api/registration/registrations";
import type {
  ObservationView,
  SaveObservationPayload,
} from "@/types/registration/Registration";

type IndicatorEntry = {
  score: number | null;
  note: string;
};

export function useObservation(initial: ObservationView, initialStep: number) {
  const router = useRouter();
  const toast = useToast();
  const [view, setView] = useState(initial);
  const [entries, setEntries] = useState(() => toEntries(initial));
  const [openNotes, setOpenNotes] = useState<number[]>([]);
  const [note, setNote] = useState(initial.note ?? "");
  const [recommendation, setRecommendation] = useState(
    initial.recommendation ?? "",
  );
  const [step, setStep] = useState(initialStep);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const profileStep = view.dimensions.length;

  function updateEntry(indicator: number, patch: Partial<IndicatorEntry>) {
    setEntries((prev) => ({
      ...prev,
      [indicator]: { ...prev[indicator], ...patch },
    }));
    setIsDirty(true);
  }

  function toggleNote(indicator: number) {
    setOpenNotes((prev) =>
      prev.includes(indicator)
        ? prev.filter((item) => item !== indicator)
        : [...prev, indicator],
    );
  }

  async function save(isComplete: boolean): Promise<boolean> {
    const payload: SaveObservationPayload = {
      action: "save_observation",
      is_complete: isComplete,
      note,
      recommendation,
      scores: Object.entries(entries).flatMap(([indicator, entry]) =>
        entry.score === null
          ? []
          : [
              {
                indicator: Number(indicator),
                score: entry.score,
                note: entry.note,
              },
            ],
      ),
    };
    setIsSaving(true);
    try {
      const result = await saveObservation(view.registration_id, payload);
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      setView(result.observation);
      setIsDirty(false);
      return true;
    } catch (error) {
      console.error("Failed to save observation:", error);
      toast.error("Gagal menyimpan observasi");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function goToStep(nextStep: number) {
    if (view.can_edit && isDirty && !(await save(false))) return;
    setStep(nextStep);
    window.scrollTo(0, 0);
  }

  async function complete() {
    const saved = await save(true);
    if (!saved) return;
    const detailHref = `/registrations/${view.registration_id}`;
    toast.success("Observasi tersimpan");
    router.push(detailHref);
  }

  function changeNote(value: string) {
    setNote(value);
    setIsDirty(true);
  }

  function changeRecommendation(value: string) {
    setRecommendation(value);
    setIsDirty(true);
  }

  return {
    view,
    entries,
    openNotes,
    note,
    recommendation,
    step,
    profileStep,
    isSaving,
    canComplete: view.can_complete,
    updateEntry,
    toggleNote,
    goToStep,
    complete,
    changeNote,
    changeRecommendation,
  };
}

function toEntries(view: ObservationView): Record<number, IndicatorEntry> {
  const entries: Record<number, IndicatorEntry> = {};
  for (const dimension of view.dimensions) {
    for (const indicator of dimension.indicators) {
      entries[indicator.number] = {
        score: indicator.score,
        note: indicator.note ?? "",
      };
    }
  }
  return entries;
}
