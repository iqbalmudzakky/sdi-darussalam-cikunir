import { cva } from "class-variance-authority";
import { Check, Star, TrendingDown } from "lucide-react";
import type { ObservationView } from "@/types/registration/Registration";
import { Chip } from "@/components/ui/display/chip";
import { ProgressBar } from "@/components/ui/display/progress-bar";

const dimensionRowVariants = cva([
  "grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 border-b border-gray-100 py-2.5",
  "last:border-b-0 sm:grid-cols-[minmax(0,13rem)_1fr_9.5rem] md:grid-cols-[minmax(0,16rem)_1fr_9.5rem]",
]);

const recommendationVariants = cva([
  "min-h-24 w-full resize-y rounded-xl border border-brand-200 bg-white px-3.5 py-3 text-sm",
  "outline-none focus:border-brand-600 read-only:bg-gray-50",
]);

type ReadinessProfileProps = {
  view: ObservationView;
  recommendation: string;
  onRecommendationChange: (value: string) => void;
};

export function ReadinessProfile({
  view,
  recommendation,
  onRecommendationChange,
}: ReadinessProfileProps) {
  const { profile } = view;
  const highlights = [
    {
      icon: Star,
      label: "Dimensi paling kuat:",
      value: profile.strongest,
    },
    {
      icon: TrendingDown,
      label: "Dimensi yang perlu diperkuat:",
      value: profile.weakest,
    },
  ];

  return (
    <>
      <section className="space-y-2.5 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-bold text-brand-800 tabular-nums">
            {profile.score_label}
          </p>
          {profile.conclusion && (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-gray-500 sm:inline">
                Kesimpulan umum:
              </span>
              <Chip
                tone={profile.conclusion.tone}
                icon={<Check className="h-3 w-3" />}
              >
                {profile.conclusion.label}
              </Chip>
            </div>
          )}
        </div>
        <ProgressBar ratio={profile.ratio} tone={profile.conclusion?.tone} />
        <div className="space-y-1">
          {highlights.map(({ icon: Icon, label, value }) => (
            <p key={label} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
              <span className="shrink-0 text-gray-500">{label}</span>
              <span className="min-w-0 font-semibold text-gray-900">
                {value ?? "-"}
              </span>
            </p>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 shadow-(--admin-card-shadow)">
        {view.dimensions.map((dimension) => (
          <div key={dimension.name} className={dimensionRowVariants()}>
            <span className="text-sm font-medium text-gray-900">
              {dimension.name}
            </span>
            <span className="justify-self-end sm:col-start-3 sm:row-start-1">
              {dimension.category && (
                <Chip tone={dimension.category.tone}>
                  {dimension.category.label}
                </Chip>
              )}
            </span>
            <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1 sm:col-start-2 sm:row-start-1">
              <div className="min-w-0 flex-1">
                <ProgressBar
                  ratio={dimension.ratio}
                  tone={dimension.category?.tone}
                />
              </div>
              <span className="w-28 shrink-0 text-sm font-semibold whitespace-nowrap text-gray-700 tabular-nums">
                {dimension.score_label}
              </span>
            </div>
          </div>
        ))}
      </section>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-gray-700">
          Catatan/Rekomendasi
        </span>
        <textarea
          value={recommendation}
          readOnly={!view.can_edit}
          maxLength={3000}
          onChange={(event) => onRecommendationChange(event.target.value)}
          className={recommendationVariants()}
        />
      </label>
    </>
  );
}
