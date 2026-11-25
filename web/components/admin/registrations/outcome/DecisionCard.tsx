"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Check, Pencil, Scale, X } from "lucide-react";
import { Chip } from "@/components/ui/display/chip";
import { Button } from "@/components/ui/form/button";
import { REGISTRATION_STATUS_LABEL } from "@/lib/registrationOptions";
import type {
  RegistrationDetail,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";

const cardVariants = cva(
  "space-y-3.5 rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

type DecisionCardProps = {
  registration: RegistrationDetail;
  isSaving: boolean;
  onSave: (input: UpdateRegistrationInput) => Promise<boolean>;
};

export function DecisionCard({
  registration,
  isSaving,
  onSave,
}: DecisionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { decision, can_decide: canDecide } = registration;
  const showChoices = canDecide && (decision === null || isEditing);

  async function handleDecide(result: "accepted" | "rejected") {
    const input: UpdateRegistrationInput = { action: "decide", result };
    const saved = await onSave(input);
    if (saved) setIsEditing(false);
  }

  if (decision === null && !canDecide) return null;

  return (
    <section className={cardVariants()}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Scale className="h-4 w-4" />
        </span>
        <h2 className="flex-1 text-sm font-semibold text-gray-900">
          Keputusan
        </h2>
        {decision && (
          <Chip
            tone={decision === "accepted" ? "brand" : "red"}
            icon={
              decision === "accepted" ? (
                <Check className="h-3 w-3" />
              ) : (
                <X className="h-3 w-3" />
              )
            }
          >
            {REGISTRATION_STATUS_LABEL[decision]}
          </Chip>
        )}
        {decision && canDecide && !isEditing && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setIsEditing(true)}
            aria-label="Ubah keputusan"
            title="Ubah keputusan"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showChoices && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => handleDecide("accepted")}
            disabled={isSaving}
            className="h-11 sm:flex-1"
          >
            <Check className="h-4 w-4" />
            Diterima
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleDecide("rejected")}
            disabled={isSaving}
            className="h-11 sm:flex-1"
          >
            <X className="h-4 w-4" />
            Tidak Diterima
          </Button>
        </div>
      )}
    </section>
  );
}
