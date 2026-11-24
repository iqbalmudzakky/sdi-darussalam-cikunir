import { cva } from "class-variance-authority";
import { formatNumericDateOnly } from "@/lib/date";
import type { ObservationView } from "@/types/registration/Registration";

const dataRowVariants = cva([
  "flex items-baseline justify-between gap-4 border-b border-gray-100 py-2",
  "text-sm last:border-b-0",
]);

const noteInputVariants = cva([
  "h-11 w-full rounded-xl border border-brand-200 bg-white px-3.5 text-sm",
  "outline-none focus:border-brand-600 read-only:bg-gray-50",
]);

type ObservationHeaderProps = {
  view: ObservationView;
  note: string;
  onNoteChange: (value: string) => void;
};

export function ObservationHeader({
  view,
  note,
  onNoteChange,
}: ObservationHeaderProps) {
  const rows = [
    {
      label: "Tanggal Lahir",
      value: formatNumericDateOnly(view.date_of_birth),
    },
    { label: "Observer", value: view.observer_name },
    { label: "Usia Pada Bulan Juli", value: view.entry_age_label },
    {
      label: "Tanggal Observasi",
      value: formatNumericDateOnly(view.observed_on),
    },
    { label: "Asal TK/RA/PAUD", value: view.previous_school },
  ];

  return (
    <>
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)">
        <div className="mb-1 flex items-start justify-between gap-3">
          <h2 className="min-w-0 text-lg font-semibold break-words text-gray-900">
            {view.full_name}
          </h2>
          {view.registration_number && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
              {view.registration_number}
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 sm:gap-x-8">
          {rows.map((row) => (
            <div key={row.label} className={dataRowVariants()}>
              <span className="shrink-0 text-gray-500">{row.label}</span>
              <span className="min-w-0 text-right font-semibold break-words text-gray-900">
                {row.value || "-"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-gray-700">
          Note (opsional)
        </span>
        <input
          type="text"
          value={note}
          readOnly={!view.can_edit}
          maxLength={1000}
          onChange={(event) => onNoteChange(event.target.value)}
          className={noteInputVariants()}
        />
      </label>
    </>
  );
}
