"use client";

import { useState, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RegistrationForm } from "@/components/sections/RegistrationForm";
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

          <DialogDescription className="text-sm text-ink-500">
            Isi data di bawah ini. Tim kami akan menghubungi Anda kembali
            melalui WhatsApp.
          </DialogDescription>
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
  return (
    <button
      type="button"
      onClick={onClick}
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
