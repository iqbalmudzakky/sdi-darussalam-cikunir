"use client";

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import {
  MessageCircle,
  Phone,
  Plus,
  Trash2,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import {
  DateField,
  TextField,
} from "@/components/sections/RegistrationForm/fields";
import { Chip } from "@/components/ui/display/chip";
import { Button } from "@/components/ui/form/button";
import { formatAmount } from "@/lib/payment";
import { DATE_PICKER_YEARS_AHEAD } from "@/lib/shared/constant/datePicker";
import { PROGRAM_FEE_FIELDS } from "@/lib/shared/constant/admissionSettings";
import type {
  MoneyKey,
  TextKey,
  useAdmissionSettings,
} from "@/hooks/useAdmissionSettings";

const cardVariants = cva(
  "space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const contactBoxVariants = cva(
  "space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3",
);

const programBlockVariants = cva(
  "space-y-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0",
);

type SettingsState = ReturnType<typeof useAdmissionSettings>;

type CardProps = {
  state: SettingsState;
};

export function FeeCard({ state }: CardProps) {
  return (
    <SettingsCard title="Biaya masuk" icon={Wallet}>
      {PROGRAM_FEE_FIELDS.map((program) => {
        const total =
          Number(state.form[program.yearly]) + Number(state.form[program.july]);
        return (
          <div key={program.name} className={programBlockVariants()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-gray-900">
                {program.name}
              </h3>
              <Chip tone="brand">Total {formatAmount(total)}</Chip>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyField
                state={state}
                name={program.yearly}
                label="Uang Awal Tahun"
              />
              <MoneyField
                state={state}
                name={program.july}
                label="Iuran Juli"
              />
            </div>
          </div>
        );
      })}
    </SettingsCard>
  );
}

export function DiscountCard({ state }: CardProps) {
  const today = new Date();
  const lastDay = new Date(
    today.getFullYear() + DATE_PICKER_YEARS_AHEAD,
    11,
    31,
  );
  return (
    <SettingsCard title="Diskon & batas bayar" icon={Wallet}>
      <div className="grid gap-3 sm:grid-cols-2">
        <MoneyField
          state={state}
          name="darussalam_discount"
          label="Lulusan TK Islam Darussalam"
        />
        <MoneyField
          state={state}
          name="other_discount"
          label="Lulusan TK lain"
        />
      </div>
      <DateField
        id="payment-deadline"
        label="Batas pembayaran uang masuk"
        startMonth={today}
        endMonth={lastDay}
        minDate={today}
        value={state.form.payment_deadline}
        onChange={(value) => state.setField("payment_deadline", value)}
        required
      />
    </SettingsCard>
  );
}

type TextCardProps = CardProps & {
  title: string;
  icon: LucideIcon;
  fields: readonly { name: TextKey; label: string }[];
};

export function TextCard({ state, title, icon, fields }: TextCardProps) {
  return (
    <SettingsCard title={title} icon={icon}>
      {fields.map((field) => (
        <TextField
          key={field.name}
          id={`settings-${field.name}`}
          label={field.label}
          value={state.form[field.name]}
          onChange={(value) => state.setField(field.name, value)}
          maxLength={120}
          required
        />
      ))}
    </SettingsCard>
  );
}

export function ContactCard({ state }: CardProps) {
  return (
    <SettingsCard title="Kontak" icon={MessageCircle}>
      <TextField
        id="settings-pmb-contact"
        label="CP PMB (WhatsApp setelah form pendek)"
        value={state.form.pmb_contact_phone}
        onChange={(value) => state.setField("pmb_contact_phone", value)}
        inputMode="tel"
        required
      />
      <div className="space-y-2.5">
        <p className="text-sm font-medium text-ink-700">
          CP di Surat Diterima<span className="ml-0.5 text-red-500">*</span>
        </p>
        {state.form.letter_contacts.map((contact, index) => (
          <div key={index} className={contactBoxVariants()}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                CP {index + 1}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => state.removeContact(index)}
                aria-label={`Hapus CP ${index + 1}`}
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-1">
              <TextField
                id={`settings-contact-name-${index}`}
                label="Nama"
                value={contact.name}
                onChange={(name) => state.setContact(index, "name", name)}
                endIcon={<UserRound className="h-4 w-4" />}
                maxLength={120}
              />
              <TextField
                id={`settings-contact-phone-${index}`}
                label="No. WhatsApp"
                value={contact.phone}
                onChange={(phone) => state.setContact(index, "phone", phone)}
                endIcon={<Phone className="h-4 w-4" />}
                inputMode="tel"
              />
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={state.addContact}
        className="h-10 w-full border-brand-200 text-brand-700 sm:w-auto"
      >
        <Plus className="h-4 w-4" />
        Tambah CP
      </Button>
    </SettingsCard>
  );
}

type SettingsCardProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
};

function SettingsCard({ title, icon: Icon, children }: SettingsCardProps) {
  return (
    <section className={cardVariants()}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

type MoneyFieldProps = CardProps & {
  name: MoneyKey;
  label: string;
};

function MoneyField({ state, name, label }: MoneyFieldProps) {
  const digits = state.form[name];
  const display = digits ? formatAmount(Number(digits)) : "";

  function handleChange(value: string) {
    const nextDigits = value.replace(/\D/g, "");
    state.setField(name, nextDigits);
  }

  return (
    <TextField
      id={`settings-${name}`}
      label={label}
      value={display}
      onChange={handleChange}
      inputMode="numeric"
      required
    />
  );
}
