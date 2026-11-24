"use client";

import { cva } from "class-variance-authority";
import { Pencil } from "lucide-react";
import type { ObservationDimension } from "@/types/registration/Registration";
import { Chip } from "@/components/ui/display/chip";

const SCORES = [1, 2, 3, 4] as const;

const indicatorRowVariants = cva(
  "space-y-2.5 border-b border-gray-100 py-3 last:border-b-0 last:pb-0",
);

const numberVariants = cva([
  "flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-gray-100",
  "text-[11px] font-semibold text-gray-500",
]);

const scoreButtonVariants = cva(
  [
    "flex h-10 flex-1 cursor-pointer items-center justify-center rounded-lg border",
    "text-sm font-semibold transition-colors sm:w-10 sm:flex-none",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      selected: { true: "text-white", false: "" },
      score: { 1: "", 2: "", 3: "", 4: "" },
    },
    compoundVariants: [
      {
        selected: false,
        className: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      },
      { selected: true, score: 1, className: "border-red-600 bg-red-600" },
      { selected: true, score: 2, className: "border-amber-500 bg-amber-500" },
      { selected: true, score: 3, className: "border-brand-600 bg-brand-600" },
      { selected: true, score: 4, className: "border-brand-600 bg-brand-600" },
    ],
  },
);

const noteButtonVariants = cva(
  [
    "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border",
    "transition-colors disabled:cursor-not-allowed",
  ],
  {
    variants: {
      active: {
        true: "border-brand-200 bg-brand-50 text-brand-700",
        false: "border-gray-200 bg-white text-gray-500 hover:bg-gray-50",
      },
    },
  },
);

const noteInputVariants = cva([
  "h-10 w-full rounded-lg border border-brand-200 bg-white px-3.5 text-sm",
  "outline-none focus:border-brand-600 read-only:bg-gray-50",
]);

type IndicatorEntry = { score: number | null; note: string };

type DimensionCardProps = {
  dimension: ObservationDimension;
  entries: Record<number, IndicatorEntry>;
  openNotes: number[];
  canEdit: boolean;
  onChange: (indicator: number, patch: Partial<IndicatorEntry>) => void;
  onToggleNote: (indicator: number) => void;
};

export function DimensionCard({
  dimension,
  entries,
  openNotes,
  canEdit,
  onChange,
  onToggleNote,
}: DimensionCardProps) {
  const filled = dimension.indicators.filter(
    (indicator) => entries[indicator.number]?.score !== null,
  ).length;
  const total = dimension.indicators.length;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-gray-900">{dimension.name}</h2>
        <Chip tone={filled === total ? "brand" : "amber"}>
          {filled}/{total}
        </Chip>
      </div>

      {dimension.indicators.map((indicator) => {
        const entry = entries[indicator.number];
        const isNoteOpen =
          openNotes.includes(indicator.number) || Boolean(entry.note);

        return (
          <div key={indicator.number} className={indicatorRowVariants()}>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-start gap-2.5">
                <span className={numberVariants()}>{indicator.number}</span>
                <span className="text-sm text-gray-900">{indicator.label}</span>
              </div>

              <div className="flex gap-2">
                {SCORES.map((score) => (
                  <button
                    key={score}
                    type="button"
                    disabled={!canEdit}
                    aria-pressed={entry.score === score}
                    onClick={() => onChange(indicator.number, { score })}
                    className={scoreButtonVariants({
                      score,
                      selected: entry.score === score,
                    })}
                  >
                    {score}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={!canEdit}
                  onClick={() => onToggleNote(indicator.number)}
                  aria-label="Catatan Observer"
                  title="Catatan Observer"
                  className={noteButtonVariants({ active: isNoteOpen })}
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </div>

            {isNoteOpen && (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-gray-500">
                  Catatan Observer
                </span>
                <input
                  type="text"
                  value={entry.note}
                  readOnly={!canEdit}
                  maxLength={500}
                  onChange={(event) =>
                    onChange(indicator.number, { note: event.target.value })
                  }
                  className={noteInputVariants()}
                />
              </label>
            )}
          </div>
        );
      })}
    </section>
  );
}
