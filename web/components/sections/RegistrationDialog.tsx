"use client";

import { useRef, useState, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationForm } from "@/components/sections/RegistrationForm/RegistrationForm";
import { useToast } from "@/hooks/useToast";
import { fetchRegistrationOpen } from "@/lib/api/registrationWindow";
import { cn } from "@/lib/utils";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="border-brand-100 bg-paper">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-semibold text-ink-900">
            Formulir pendaftaran
          </DialogTitle>
        </DialogHeader>

        <RegistrationForm onSuccess={() => onOpenChange(false)} />
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
