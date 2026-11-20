"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { buildRegistrationsExportUrl } from "@/lib/api/registration/registrations";
import { REGISTRATION_STATUS_OPTIONS } from "@/lib/registrationOptions";
import type { RegistrationStatus } from "@/types/registration/Registration";

const statusRowVariants = cva(
  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
  {
    variants: {
      checked: {
        true: "bg-brand-50 text-brand-700",
        false: "bg-gray-50 text-gray-600 hover:bg-gray-100",
      },
    },
  },
);

const checkboxVariants = cva(
  "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
  {
    variants: {
      checked: {
        true: "border-brand-600 bg-brand-600 text-white",
        false: "border-gray-300 bg-white",
      },
    },
  },
);

type ExportRegistrationsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ExportRegistrationsDialog({
  open,
  onOpenChange,
}: ExportRegistrationsDialogProps) {
  const [statuses, setStatuses] = useState<RegistrationStatus[]>([]);

  function toggleStatus(status: RegistrationStatus) {
    setStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((value) => value !== status)
        : [...prev, status],
    );
  }

  function handleDownload() {
    window.location.href = buildRegistrationsExportUrl(statuses);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Download Excel</DialogTitle>
          <DialogDescription>Kosong = semua status</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          {REGISTRATION_STATUS_OPTIONS.map((option) => {
            const checked = statuses.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                role="checkbox"
                aria-checked={checked}
                onClick={() => toggleStatus(option.value)}
                className={statusRowVariants({ checked })}
              >
                <span className={checkboxVariants({ checked })}>
                  {checked && <Check className="h-3 w-3" />}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
