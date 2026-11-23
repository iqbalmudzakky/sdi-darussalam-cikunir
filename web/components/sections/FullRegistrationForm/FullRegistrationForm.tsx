"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cva } from "class-variance-authority";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  Clock,
  Loader2,
  MessageCircle,
  Send,
} from "lucide-react";
import { RegistrationFlowSteps } from "@/components/sections/RegistrationForm/RegistrationFlowSteps";
import { useFullRegistrationForm } from "@/hooks/useRegistrations";
import { useToast } from "@/hooks/useToast";
import type {
  FullFormStep,
  FullRegistrationFormInput,
} from "@/types/registration/Registration";
import { ChildStep } from "./ChildStep";
import { ParentsStep } from "./ParentsStep";
import { SubmitStep } from "./SubmitStep";

const layoutVariants = cva([
  "mx-auto max-w-xl md:max-w-3xl",
  "lg:grid lg:max-w-6xl lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-10",
]);

const stepTabVariants = cva(
  [
    "flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl px-2 py-2.5",
    "text-xs font-medium transition-colors md:text-sm",
    "lg:flex-none lg:justify-start lg:px-3 lg:text-[15px]",
  ],
  {
    variants: {
      active: {
        true: "bg-brand-600 text-white lg:bg-brand-50 lg:font-semibold lg:text-ink-900",
        false:
          "bg-brand-50 text-brand-700 hover:bg-brand-100 lg:bg-transparent lg:text-ink-700",
      },
    },
  },
);

const stepNumberVariants = cva(
  "hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold lg:flex",
  {
    variants: {
      active: {
        true: "border-brand-600 bg-brand-600 text-white",
        false: "border-brand-200 bg-white text-ink-500",
      },
    },
  },
);

const numberChipVariants = cva(
  "rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 lg:text-sm",
);

const formCardVariants = cva([
  "md:rounded-2xl md:border md:border-brand-100 md:bg-white md:p-6 lg:p-8",
]);

const primaryButtonVariants = cva([
  "flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl",
  "bg-brand-600 px-6 font-medium text-white transition-colors hover:bg-brand-700",
  "disabled:cursor-not-allowed disabled:opacity-60 md:flex-none md:min-w-48",
]);

const backButtonVariants = cva([
  "flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center",
  "rounded-xl border border-brand-200 bg-white text-ink-700 hover:bg-brand-50",
]);

const resultCardVariants = cva([
  "mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border",
  "border-brand-100 bg-white p-6 text-center",
]);

const receiptNumberVariants = cva(
  "mt-3 mb-4 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-sm font-semibold text-brand-700",
);

const whatsappButtonVariants = cva([
  "mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600",
  "px-5 py-3.5 font-medium text-white transition-colors hover:bg-green-700",
]);

export function FullRegistrationForm({
  token,
  form,
}: FullRegistrationFormInput) {
  const steps: { key: FullFormStep; number: number; label: string }[] = [
    { key: "child", number: 1, label: "Anak" },
    { key: "parents", number: 2, label: "Orang tua" },
    { key: "submit", number: 3, label: "Kirim" },
  ];
  const toast = useToast();
  const controller = useFullRegistrationForm({ token, form });
  const [focusRequest, setFocusRequest] = useState(0);
  const stepIndex = steps.findIndex((step) => step.key === controller.step);
  const stepsWithErrors = findStepsWithErrors(controller.fieldErrors);

  useEffect(() => {
    if (focusRequest === 0) return;
    const firstInvalid = document.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
    firstInvalid?.focus({ preventScroll: true });
  }, [focusRequest]);

  function goToStep(step: FullFormStep) {
    controller.setStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit() {
    const result = await controller.submit();
    if (!result || result.ok) return;

    const firstErrorStep = findStepsWithErrors(result.fieldErrors)[0];
    if (!firstErrorStep) {
      toast.error(result.error);
      return;
    }
    controller.setStep(firstErrorStep);
    setFocusRequest((count) => count + 1);
  }

  if (controller.receipt) {
    return (
      <div className={resultCardVariants()}>
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <CircleCheck className="h-8 w-8" />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">
          Form lengkap terkirim
        </h1>
        <p className={receiptNumberVariants()}>
          No. {controller.receipt.registration_number ?? "-"}
        </p>
        <RegistrationFlowSteps steps={controller.receipt.flow_steps} />
      </div>
    );
  }

  return (
    <div className={layoutVariants()}>
      <aside className="lg:sticky lg:top-10">
        <header className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-start">
          <span className="flex flex-1 items-center gap-3">
            <Image src="/logo.png" alt="" width={28} height={28} />
            <h1 className="font-display text-xl font-semibold text-ink-900 lg:text-2xl">
              Form Lengkap
            </h1>
          </span>
          <span className={numberChipVariants()}>
            No. {controller.registrationNumber ?? "-"}
          </span>
        </header>

        <nav className="mt-4 mb-6 flex gap-2 lg:mt-6 lg:mb-0 lg:flex-col lg:gap-1.5">
          {steps.map((step) => {
            const isActive = controller.step === step.key;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => goToStep(step.key)}
                aria-current={isActive}
                className={stepTabVariants({ active: isActive })}
              >
                <span className={stepNumberVariants({ active: isActive })}>
                  {step.number}
                </span>
                <span>
                  <span className="lg:hidden">{step.number} </span>
                  {step.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className={formCardVariants()}>
        {controller.step === "child" && <ChildStep form={controller} />}
        {controller.step === "parents" && <ParentsStep form={controller} />}
        {controller.step === "submit" && (
          <SubmitStep
            form={controller}
            stepsWithErrors={stepsWithErrors}
            onEditStep={goToStep}
          />
        )}

        <div className="mt-8 flex gap-3 md:justify-end">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={() => goToStep(steps[stepIndex - 1].key)}
              aria-label="Kembali"
              className={backButtonVariants()}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {controller.step === "submit" ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={controller.isSubmitting}
              className={primaryButtonVariants()}
            >
              {controller.isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Kirim
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goToStep(steps[stepIndex + 1].key)}
              className={primaryButtonVariants()}
            >
              Lanjut
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FullFormExpired({
  whatsappUrl,
}: {
  whatsappUrl: string | null;
}) {
  return (
    <div className={resultCardVariants()}>
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
        <Clock className="h-8 w-8" />
      </span>
      <h1 className="mt-4 font-display text-xl font-semibold text-ink-900">
        Link expired
      </h1>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={whatsappButtonVariants()}
        >
          <MessageCircle className="h-4 w-4" />
          Minta link baru
        </a>
      )}
    </div>
  );
}

function findStepsWithErrors(errors: Record<string, string>): FullFormStep[] {
  const keys = Object.entries(errors)
    .filter(([, message]) => message)
    .map(([key]) => key);
  const contactKeys = ["parent_email", "student.phone", "student.home_phone"];

  const hasChildError = keys.some(
    (key) =>
      (key.startsWith("student.") || key.startsWith("details.")) &&
      !contactKeys.includes(key),
  );
  const hasParentError = keys.some((key) =>
    ["father.", "mother.", "guardian."].some((prefix) =>
      key.startsWith(prefix),
    ),
  );
  const hasSubmitError = keys.some(
    (key) => contactKeys.includes(key) || key.startsWith("achievements."),
  );

  const steps: FullFormStep[] = [];
  if (hasChildError) steps.push("child");
  if (hasParentError) steps.push("parents");
  if (hasSubmitError) steps.push("submit");
  return steps;
}
