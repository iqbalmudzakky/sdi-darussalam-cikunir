"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  ChoiceField,
  TextField,
} from "@/components/sections/RegistrationForm/fields";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import type {
  RegistrationDetail,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";

type MarkPaidDialogProps = {
  open: boolean;
  registration: RegistrationDetail;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: UpdateRegistrationInput) => void;
};

export function MarkPaidDialog({
  open,
  onClose,
  ...formProps
}: MarkPaidDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="sm">
        <DialogTitle className="mb-4">Tandai lunas</DialogTitle>
        {open && <MarkPaidForm {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

type MarkPaidFormProps = Omit<MarkPaidDialogProps, "open" | "onClose">;

function MarkPaidForm({ registration, isSaving, onSave }: MarkPaidFormProps) {
  const [method, setMethod] = useState("CASH");
  const [receiptNumber, setReceiptNumber] = useState("");
  const methodOptions = [
    { value: "CASH", label: "Tunai" },
    { value: "TRANSFER", label: "Transfer" },
  ];
  const identity = [registration.full_name, registration.registration_number]
    .filter(Boolean)
    .join(" · ");

  function handleSubmit() {
    const input: UpdateRegistrationInput = {
      action: "mark_paid",
      payment: {
        method: method as "CASH" | "TRANSFER",
        receipt_number: receiptNumber,
      },
    };
    onSave(input);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-xl bg-brand-50 px-3.5 py-3">
        <span className="min-w-0 truncate text-sm text-brand-700">
          {identity}
        </span>
        <span className="font-semibold text-brand-800 tabular-nums">
          {registration.payment.amount_label}
        </span>
      </div>

      <ChoiceField
        id="payment-method"
        label="Metode"
        value={method}
        options={methodOptions}
        onChange={setMethod}
        required
      />
      <TextField
        id="payment-receipt"
        label="No. kuitansi (opsional)"
        placeholder="Contoh: KW-0123"
        value={receiptNumber}
        onChange={setReceiptNumber}
      />

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
        className="h-11 w-full"
      >
        {isSaving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
        Tandai lunas
      </Button>
    </div>
  );
}
