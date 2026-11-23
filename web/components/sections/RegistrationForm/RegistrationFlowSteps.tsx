import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import type { ShortRegistrationReceipt } from "@/types/registration/Registration";

const stepMarkerVariants = cva(
  [
    "relative z-10 flex h-6.5 w-6.5 shrink-0 items-center justify-center",
    "rounded-full border text-xs font-semibold",
  ],
  {
    variants: {
      state: {
        done: "border-brand-600 bg-brand-600 text-white",
        current: "border-2 border-brand-600 bg-brand-100 text-brand-700",
        upcoming: "border-brand-200 bg-white text-ink-500",
      },
    },
  },
);

const stepLabelVariants = cva("text-sm", {
  variants: {
    state: {
      done: "text-ink-500",
      current: "font-semibold text-ink-900",
      upcoming: "text-ink-700",
    },
  },
});

type RegistrationFlowStepsProps = {
  steps: ShortRegistrationReceipt["flow_steps"];
};

export function RegistrationFlowSteps({ steps }: RegistrationFlowStepsProps) {
  const lastStepIndex = steps.length - 1;

  return (
    <div className="w-full rounded-xl border border-brand-100 bg-white p-4">
      <p className="mb-3 text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
        Alur pendaftaran
      </p>

      <ol>
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="relative flex items-center gap-3 pb-3.5 last:pb-0"
          >
            {index < lastStepIndex && (
              <span
                aria-hidden="true"
                className="absolute top-6 bottom-0 left-3 w-px bg-brand-200"
              />
            )}

            <span className={stepMarkerVariants({ state: step.state })}>
              {step.state === "done" ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                index + 1
              )}
            </span>

            <span className={stepLabelVariants({ state: step.state })}>
              {step.label}
            </span>

            {step.badge && (
              <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white">
                {step.badge}
              </span>
            )}

            {step.fee !== null && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                Rp{step.fee.toLocaleString("id-ID")}
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
