import { cva } from "class-variance-authority";

const trackVariants = cva("h-2 overflow-hidden rounded-full bg-gray-100");

const fillVariants = cva("h-full rounded-full", {
  variants: {
    tone: {
      brand: "bg-brand-600",
      amber: "bg-amber-500",
      red: "bg-red-600",
    },
  },
});

type ProgressBarProps = {
  ratio: number;
  tone?: "brand" | "amber" | "red";
};

export function ProgressBar({ ratio, tone = "brand" }: ProgressBarProps) {
  return (
    <div className={trackVariants()}>
      <div
        className={fillVariants({ tone })}
        style={{ width: `${Math.round(ratio * 100)}%` }}
      />
    </div>
  );
}
