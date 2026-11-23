"use client";

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
import type {
  FullFormStep,
  FullRegistrationFormInput,
} from "@/types/registration/Registration";
import { ChildStep } from "./ChildStep";
import { ParentsStep } from "./ParentsStep";
import { SubmitStep } from "./SubmitStep";

const stepTabVariants = cva(
  "flex-1 cursor-pointer rounded-xl px-2 py-2.5 text-xs font-medium transition-colors",
  {
    variants: {
      active: {
        true: "bg-brand-600 text-white",
        false: "bg-brand-50 text-brand-700 hover:bg-brand-100",
      },
    },
  },
);

const primaryButtonVariants = cva([
  "flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl",
  "bg-brand-600 font-medium text-white transition-colors hover:bg-brand-700",
  "disabled:cursor-not-allowed disabled:opacity-60",
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
  const steps: { key: FullFormStep; label: string }[] = [
    { key: "child", label: "1 Anak" },
    { key: "parents", label: "2 Orang tua" },
    { key: "submit", label: "3 Kirim" },
  ];
  const controller = useFullRegistrationForm({ token, form });
  const stepIndex = steps.findIndex((step) => step.key === controller.step);
  const stepsWithErrors = findStepsWithErrors(controller.fieldErrors);

  async function handleSubmit() {
    const errors = await controller.submit();
    const firstErrorStep = errors ? findStepsWithErrors(errors)[0] : undefined;
    if (firstErrorStep) controller.setStep(firstErrorStep);
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
    <div className="mx-auto max-w-xl">
      <header className="flex items-center gap-3">
        <Image src="/logo.png" alt="" width={28} height={28} />
        <h1 className="flex-1 font-display text-xl font-semibold text-ink-900">
          Form Lengkap
        </h1>
        <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
          {controller.registrationNumber ?? "-"}
        </span>
      </header>

      <nav className="mt-4 mb-6 flex gap-2">
        {steps.map((step) => (
          <button
            key={step.key}
            type="button"
            onClick={() => controller.setStep(step.key)}
            aria-current={controller.step === step.key}
            className={stepTabVariants({
              active: controller.step === step.key,
            })}
          >
            {step.label}
          </button>
        ))}
      </nav>

      {controller.step === "child" && <ChildStep form={controller} />}
      {controller.step === "parents" && <ParentsStep form={controller} />}
      {controller.step === "submit" && (
        <SubmitStep form={controller} stepsWithErrors={stepsWithErrors} />
      )}

      {controller.submitError && (
        <p role="alert" className="mt-6 text-center text-sm text-red-600">
          {controller.submitError}
        </p>
      )}

      <div className="mt-6 flex gap-3">
        {stepIndex > 0 && (
          <button
            type="button"
            onClick={() => controller.setStep(steps[stepIndex - 1].key)}
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
            onClick={() => controller.setStep(steps[stepIndex + 1].key)}
            className={primaryButtonVariants()}
          >
            Lanjut
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
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

  const steps: FullFormStep[] = [];
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
  if (hasChildError) steps.push("child");
  if (hasParentError) steps.push("parents");
  if (hasSubmitError) steps.push("submit");
  return steps;
}
