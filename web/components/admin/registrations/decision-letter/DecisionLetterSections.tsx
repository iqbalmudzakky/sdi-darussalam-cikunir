"use client";

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { Check, X } from "lucide-react";
import {
  DateField,
  FormSection,
  TextField,
} from "@/components/sections/RegistrationForm/fields";
import { Chip } from "@/components/ui/display/chip";
import type { useDecisionLetterForm } from "@/hooks/useDecisionLetterForm";
import {
  DECISION_BANK_FIELDS,
  DECISION_CHILD_FIELDS,
  DECISION_SIGNER_FIELDS,
} from "@/lib/shared/constant/decisionLetter";
import { DATE_PICKER_YEARS_AHEAD } from "@/lib/shared/constant/datePicker";

const cardVariants = cva(
  "rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const fullRowVariants = cva("md:col-span-2");

type DecisionLetterState = ReturnType<typeof useDecisionLetterForm>;

type SectionProps = {
  state: DecisionLetterState;
};

export function LetterSection({ state }: SectionProps) {
  const { content, view } = state;
  const resultIcon = view.is_accepted ? (
    <Check className="h-3 w-3" />
  ) : (
    <X className="h-3 w-3" />
  );

  return (
    <Card>
      <FormSection title="Surat">
        <TextField
          id="decision-letter-number"
          label="Nomor"
          value={content.letter_number}
          onChange={(value) => state.setLetter("letter_number", value)}
          maxLength={60}
          required
        />
        <DateField
          id="decision-letter-date"
          label="Tanggal"
          value={content.letter_date}
          onChange={(value) => state.setLetter("letter_date", value)}
          endMonth={lastPickerDay()}
          required
        />
        <div className="flex items-center justify-between gap-3 md:col-span-2">
          <span className="text-sm text-gray-500">Dinyatakan</span>
          <Chip tone={view.is_accepted ? "brand" : "red"} icon={resultIcon}>
            {view.result_label}
          </Chip>
        </div>
      </FormSection>
    </Card>
  );
}

export function ChildSection({ state }: SectionProps) {
  const { child } = state.content;

  return (
    <Card>
      <FormSection title="Calon murid">
        {DECISION_CHILD_FIELDS.map((field) => (
          <TextField
            key={field.name}
            id={`decision-child-${field.name}`}
            label={field.label}
            value={child[field.name]}
            onChange={(value) => state.setChild(field.name, value)}
            maxLength={200}
            required
          />
        ))}
      </FormSection>
    </Card>
  );
}

export function PaymentSection({ state }: SectionProps) {
  const { payment } = state.content;

  return (
    <Card>
      <FormSection title="Pembayaran">
        <div className={fullRowVariants()}>
          <DateField
            id="decision-payment-deadline"
            label="Batas administrasi"
            value={payment.deadline}
            onChange={(value) => state.setPayment("deadline", value)}
            endMonth={lastPickerDay()}
            required
          />
        </div>
        {DECISION_BANK_FIELDS.map((field) => (
          <TextField
            key={field.name}
            id={`decision-payment-${field.name}`}
            label={field.label}
            value={payment[field.name]}
            onChange={(value) => state.setPayment(field.name, value)}
            maxLength={200}
            required
          />
        ))}
      </FormSection>
    </Card>
  );
}

export function SignerSection({ state }: SectionProps) {
  const { signers, contacts } = state.content;
  const showContacts = state.view.is_accepted && contacts.length > 0;

  return (
    <Card>
      <FormSection title="Penanda tangan & kontak">
        {DECISION_SIGNER_FIELDS.map((field) => (
          <TextField
            key={field.name}
            id={`decision-signer-${field.name}`}
            label={field.label}
            value={signers[field.name]}
            onChange={(value) => state.setSigner(field.name, value)}
            maxLength={200}
            required
          />
        ))}
        {showContacts && (
          <div className="space-y-1 text-sm text-gray-700 md:col-span-2">
            <p className="font-medium text-ink-700">Contact</p>
            {contacts.map((contact, index) => (
              <p key={`${contact.name}-${index}`}>
                {index + 1}. {contact.name} ({contact.phone})
              </p>
            ))}
          </div>
        )}
      </FormSection>
    </Card>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <section className={cardVariants()}>{children}</section>;
}

function lastPickerDay(): Date {
  const today = new Date();
  const lastDay = new Date(
    today.getFullYear() + DATE_PICKER_YEARS_AHEAD,
    11,
    31,
  );
  return lastDay;
}
