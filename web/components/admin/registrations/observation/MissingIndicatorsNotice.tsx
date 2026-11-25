import { cva } from "class-variance-authority";
import { CircleAlert } from "lucide-react";
import type { ObservationView } from "@/types/registration/Registration";

const noticeVariants = cva(
  "space-y-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3",
);

const missingChipVariants = cva([
  "cursor-pointer rounded-full border border-amber-200 bg-white px-2.5 py-0.5",
  "text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100",
  "disabled:cursor-wait",
]);

type MissingIndicatorsNoticeProps = {
  items: ObservationView["missing_indicators"];
  isSaving: boolean;
  onSelect: (step: number) => void;
};

export function MissingIndicatorsNotice({
  items,
  isSaving,
  onSelect,
}: MissingIndicatorsNoticeProps) {
  return (
    <div className={noticeVariants()}>
      <p className="flex items-center gap-2 text-sm font-semibold text-amber-700">
        <CircleAlert className="h-4 w-4" />
        Belum diisi
      </p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item.step}
            type="button"
            disabled={isSaving}
            onClick={() => onSelect(item.step)}
            className={missingChipVariants()}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
