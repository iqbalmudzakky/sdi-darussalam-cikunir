"use client";

import { cva } from "class-variance-authority";
import { Chip } from "@/components/ui/display/chip";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  NOTE_GUIDE,
  RANGE_GUIDE,
  SCORE_GUIDE,
} from "@/lib/shared/constant/observation";

const sectionTitleVariants = cva(
  "mb-2 text-xs font-semibold tracking-wider text-brand-700 uppercase",
);

const rangeRowVariants = cva(
  "flex items-center justify-between gap-3 border-b border-gray-100 py-2 text-sm last:border-b-0",
);

const scoreBadgeVariants = cva(
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white",
  {
    variants: {
      score: {
        1: "bg-red-600",
        2: "bg-amber-500",
        3: "bg-brand-600",
        4: "bg-brand-600",
      },
    },
  },
);

const noteBoxVariants = cva([
  "space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3",
  "text-xs text-gray-700",
]);

type ObservationGuideDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function ObservationGuideDialog({
  open,
  onClose,
}: ObservationGuideDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="sm">
        <DialogTitle className="mb-4">Petunjuk Penggunaan</DialogTitle>

        <div className="space-y-4">
          <section>
            <h3 className={sectionTitleVariants()}>Skor</h3>
            <div className="space-y-2">
              {SCORE_GUIDE.map((item) => (
                <div key={item.score} className="flex items-center gap-2.5">
                  <span className={scoreBadgeVariants({ score: item.score })}>
                    {item.score}
                  </span>
                  <span className="text-sm text-gray-800">{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          {RANGE_GUIDE.map((group) => (
            <section key={group.title}>
              <h3 className={sectionTitleVariants()}>{group.title}</h3>
              {group.rows.map((row) => (
                <div key={row.label} className={rangeRowVariants()}>
                  <Chip tone={row.tone}>{row.label}</Chip>
                  <span className="font-semibold text-gray-700 tabular-nums">
                    {row.range}
                  </span>
                </div>
              ))}
            </section>
          ))}

          <div className={noteBoxVariants()}>
            {NOTE_GUIDE.map((note) => (
              <p key={note.label}>
                <span className="block font-semibold text-amber-700">
                  {note.label}
                </span>
                {note.text}
              </p>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
