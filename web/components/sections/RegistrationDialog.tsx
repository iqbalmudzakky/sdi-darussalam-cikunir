"use client";

import { useRef, useState, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  ArrowLeftRight,
  Check,
  ChevronRight,
  CircleCheck,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShortRegistrationForm } from "@/components/sections/RegistrationForm/ShortRegistrationForm";
import { useToast } from "@/hooks/useToast";
import { fetchRegistrationOpen } from "@/lib/api/registration/registrationWindow";
import { cn } from "@/lib/utils";
import type {
  RegistrationType,
  ShortRegistrationReceipt,
} from "@/types/registration/Registration";

const triggerVariants = cva(
  [
    "group inline-flex cursor-pointer items-center justify-center gap-2",
    "font-medium transition-colors",
  ],
  {
    variants: {
      variant: {
        /* Tombol utama di hero dan section pendaftaran. */
        primary: "bg-brand-600 px-6 py-3.5 text-white hover:bg-brand-700",

        /* Tombol ringkas di navbar desktop. */
        compact:
          "bg-brand-600 px-4 py-2 text-[14px] text-white hover:bg-brand-700",

        /* Tombol lebar di menu navigasi mobile. */
        block:
          "w-full bg-brand-600 px-4 py-3 text-[15px] text-white hover:bg-brand-700",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

const typeOptionVariants = cva([
  "flex w-full cursor-pointer items-center gap-3.5 rounded-xl border",
  "border-brand-100 bg-white p-4 text-left transition-colors",
  "hover:border-brand-300",
]);

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

const registrationNumberVariants = cva([
  "mt-3 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1",
  "text-sm font-semibold text-brand-700",
]);

const whatsappButtonVariants = cva([
  "mt-4 flex w-full items-center justify-center gap-2 rounded-xl",
  "bg-green-600 px-5 py-3.5 font-medium text-white transition-colors",
  "hover:bg-green-700",
]);

type RegistrationStep =
  | { name: "type" }
  | { name: "form"; registrationType: RegistrationType }
  | { name: "submitted"; receipt: ShortRegistrationReceipt };

type RegistrationFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/*
 * Dialog formulir pendaftaran tanpa tombol pemicu.
 *
 * Dipakai ketika tombolnya berada di dalam elemen yang
 * bisa hilang dari DOM, misalnya panel menu mobile. Kalau
 * dialog ikut berada di dalam elemen itu, menutup panel
 * juga akan melepas dialognya sebelum sempat tampil.
 */
export function RegistrationFormDialog({
  open,
  onOpenChange,
}: RegistrationFormDialogProps) {
  const firstStep: RegistrationStep = { name: "type" };
  const [step, setStep] = useState<RegistrationStep>(firstStep);
  const formTitle = {
    siswa_baru: "Daftar PMB",
    pindahan: "Daftar Pindahan",
  };

  function handleSelectType(registrationType: RegistrationType) {
    const formStep: RegistrationStep = { name: "form", registrationType };
    setStep(formStep);
  }

  function handleSubmitted(receipt: ShortRegistrationReceipt) {
    const submittedStep: RegistrationStep = { name: "submitted", receipt };
    setStep(submittedStep);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      disablePointerDismissal={step.name === "form"}
      onOpenChangeComplete={(isOpen) => {
        if (!isOpen) setStep(firstStep);
      }}
    >
      <DialogContent
        size={step.name === "type" ? "sm" : "default"}
        showCloseButton={
          step.name !== "submitted" || !step.receipt.whatsapp_url
        }
        className="border-brand-100 bg-paper"
      >
        {step.name !== "submitted" && (
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-semibold text-ink-900">
              {step.name === "type"
                ? "Daftar sebagai"
                : formTitle[step.registrationType]}
            </DialogTitle>
          </DialogHeader>
        )}

        {step.name === "type" && (
          <RegistrationTypeStep onSelect={handleSelectType} />
        )}

        {step.name === "form" && (
          <ShortRegistrationForm
            registrationType={step.registrationType}
            onSubmitted={handleSubmitted}
          />
        )}

        {step.name === "submitted" && (
          <RegistrationSubmitted receipt={step.receipt} />
        )}
      </DialogContent>
    </Dialog>
  );
}

type RegistrationTriggerProps = VariantProps<typeof triggerVariants> & {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

/*
 * Tombol dengan gaya pendaftaran, tanpa dialog.
 *
 * Dipakai bersama RegistrationFormDialog ketika state
 * dialog dipegang komponen induk.
 */
export function RegistrationTrigger({
  children,
  variant,
  className,
  onClick,
}: RegistrationTriggerProps) {
  const toast = useToast();
  const isCheckingRef = useRef(false);

  const handleClick = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;

    const isOpen = await fetchRegistrationOpen();

    isCheckingRef.current = false;

    if (!isOpen) {
      toast.error(
        "Pendaftaran belum dibuka",
        "Nantikan pengumuman jadwal pendaftaran dari kami.",
      );
      return;
    }

    onClick?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(triggerVariants({ variant }), className)}
    >
      {children}
    </button>
  );
}

type RegistrationDialogProps = VariantProps<typeof triggerVariants> & {
  children: ReactNode;
  className?: string;
};

/*
 * Tombol pemicu sekaligus dialog formulir pendaftaran.
 *
 * Tombol dan dialog disatukan dalam satu komponen client
 * supaya bisa dipakai langsung dari Server Component
 * tanpa mengoper fungsi lintas batas render.
 */
export default function RegistrationDialog({
  children,
  variant,
  className,
}: RegistrationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <RegistrationTrigger
        variant={variant}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </RegistrationTrigger>

      <RegistrationFormDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}

type RegistrationTypeStepProps = {
  onSelect: (type: RegistrationType) => void;
};

function RegistrationTypeStep({ onSelect }: RegistrationTypeStepProps) {
  const typeOptions = [
    {
      value: "siswa_baru",
      label: "PMB",
      grade: "Kelas 1",
      icon: GraduationCap,
    },
    {
      value: "pindahan",
      label: "Siswa Pindahan",
      grade: "Kelas 2–6",
      icon: ArrowLeftRight,
    },
  ] as const;

  return (
    <div className="space-y-3">
      {typeOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className={typeOptionVariants()}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <option.icon className="h-5 w-5" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block font-medium text-ink-900">
              {option.label}
            </span>
            <span className="mt-1 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              {option.grade}
            </span>
          </span>

          <ChevronRight className="h-5 w-5 shrink-0 text-ink-500" />
        </button>
      ))}
    </div>
  );
}

type RegistrationSubmittedProps = {
  receipt: ShortRegistrationReceipt;
};

function RegistrationSubmitted({ receipt }: RegistrationSubmittedProps) {
  const lastStepIndex = receipt.flow_steps.length - 1;

  return (
    <div className="flex flex-col items-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <CircleCheck className="h-8 w-8" />
      </span>

      <DialogTitle className="mt-4 font-display text-xl font-semibold text-ink-900">
        Pendaftaran terkirim
      </DialogTitle>

      <p className={registrationNumberVariants()}>
        No. {receipt.registration_number}
      </p>

      <div className="mt-4 w-full rounded-xl border border-brand-100 bg-white p-4">
        <p className="mb-3 text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase">
          Alur pendaftaran
        </p>

        <ol>
          {receipt.flow_steps.map((step, index) => (
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

      {receipt.whatsapp_url && (
        <a
          href={receipt.whatsapp_url}
          target="_blank"
          rel="noopener noreferrer"
          className={whatsappButtonVariants()}
        >
          <MessageCircle className="h-4 w-4" />
          Oke, lanjut ke WhatsApp
        </a>
      )}
    </div>
  );
}
