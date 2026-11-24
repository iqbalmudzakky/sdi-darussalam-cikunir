"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  DateField,
  TextareaField,
} from "@/components/sections/RegistrationForm/fields";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import type {
  RegistrationManualResult,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";

type ManualResultDialogProps = {
  open: boolean;
  result: RegistrationManualResult | null;
  defaultDate: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (input: UpdateRegistrationInput) => void;
};

export function ManualResultDialog({
  open,
  onClose,
  ...formProps
}: ManualResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="sm">
        <DialogTitle className="mb-4">Hasil tes pindahan</DialogTitle>
        {open && <ManualResultForm {...formProps} />}
      </DialogContent>
    </Dialog>
  );
}

type ManualResultFormProps = Omit<ManualResultDialogProps, "open" | "onClose">;

function ManualResultForm({
  result,
  defaultDate,
  isSaving,
  onSave,
}: ManualResultFormProps) {
  const today = new Date();
  const [testedOn, setTestedOn] = useState(
    result?.tested_on ?? defaultDate ?? "",
  );
  const [notes, setNotes] = useState(result?.notes ?? "");

  function handleSubmit() {
    const input: UpdateRegistrationInput = {
      action: "save_manual_result",
      result: { tested_on: testedOn, notes },
    };
    onSave(input);
  }

  return (
    <div className="space-y-4">
      <DateField
        id="manual-result-date"
        label="Tanggal tes"
        value={testedOn}
        onChange={setTestedOn}
        defaultMonth={today}
        endMonth={today}
        required
      />
      <TextareaField
        id="manual-result-notes"
        label="Catatan hasil tes"
        value={notes}
        onChange={setNotes}
        rows={4}
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
        Simpan hasil tes
      </Button>
    </div>
  );
}
