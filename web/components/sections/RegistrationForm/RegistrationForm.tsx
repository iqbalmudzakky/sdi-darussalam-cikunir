"use client";

import { useState, type FormEvent } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { submitRegistration } from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";
import {
  REGISTRATION_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PHYSICAL_DISABILITY_OPTIONS,
  PARENT_RELATIONSHIP_OPTIONS,
} from "@/lib/registrationOptions";
import type { SubmitRegistrationInput } from "@/types/Registration";
import { TextField, SelectField, TextareaField } from "./fields";
import {
  EMPTY_FORM,
  FIELD_LABELS,
  validateField,
  normalizeWhatsappNumber,
  REQUIRED_FIELDS,
  PHONE_FIELDS,
  type FieldName,
  type FieldErrors,
} from "./config";

const sectionHeadingVariants = cva([
  "mb-1 border-b border-brand-200 pb-2 text-sm font-semibold text-ink-900",
]);

const honeypotVariants = cva([
  "absolute -left-2499.75 top-auto h-px w-px overflow-hidden",
]);

const submitButtonVariants = cva([
  "flex w-full cursor-pointer items-center justify-center gap-2",
  "bg-brand-600 px-5 py-3.5",
  "font-medium text-white",
  "transition-colors duration-200",
  "hover:bg-brand-700",
  "disabled:cursor-not-allowed disabled:opacity-60",
]);

type RegistrationFormProps = {
  onSuccess?: () => void;
};

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: FieldName, rawValue: string) {
    const value = PHONE_FIELDS.includes(field)
      ? rawValue.replace(/[^\d+\s()-]/g, "")
      : rawValue;

    setForm((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function handleBlur(field: FieldName) {
    setTouched((prev) => ({ ...prev, [field]: true }));

    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, form[field]),
    }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors: FieldErrors = {};

    for (const field of REQUIRED_FIELDS) {
      const error = validateField(field, form[field]);
      if (error) nextErrors[field] = error;
    }

    setTouched(
      REQUIRED_FIELDS.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {} as Partial<Record<FieldName, boolean>>,
      ),
    );

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error(
        "Periksa kembali isian Anda",
        "Beberapa kolom belum terisi dengan benar.",
      );
      return;
    }

    setIsSubmitting(true);

    const response = await submitRegistration({
      ...form,
      father_phone: normalizeWhatsappNumber(form.father_phone),
      mother_phone: normalizeWhatsappNumber(form.mother_phone),
    } as SubmitRegistrationInput);

    setIsSubmitting(false);

    if (!response.ok) {
      toast.error("Gagal mengirim pendaftaran", response.error);
      return;
    }

    toast.success(
      "Pendaftaran terkirim!",
      "Tim kami akan segera menghubungi Anda.",
    );

    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});

    onSuccess?.();
  }

  function fieldError(field: FieldName) {
    return touched[field] ? errors[field] : undefined;
  }

  function fieldId(field: FieldName) {
    return `reg-${field.replace(/_/g, "-")}`;
  }

  function renderText(
    field: FieldName,
    options?: {
      type?: string;
      placeholder?: string;
      optional?: boolean;
      autoComplete?: string;
      inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    },
  ) {
    return (
      <TextField
        id={fieldId(field)}
        label={FIELD_LABELS[field]}
        value={form[field]}
        onChange={(value) => updateField(field, value)}
        onBlur={() => handleBlur(field)}
        error={fieldError(field)}
        optional={options?.optional}
        type={options?.type}
        placeholder={options?.placeholder}
        autoComplete={options?.autoComplete}
        inputMode={options?.inputMode}
      />
    );
  }

  function renderSelect(
    field: FieldName,
    options: { value: string; label: string }[],
  ) {
    return (
      <SelectField
        id={fieldId(field)}
        label={FIELD_LABELS[field]}
        value={form[field]}
        onChange={(value) => updateField(field, value)}
        onBlur={() => handleBlur(field)}
        error={fieldError(field)}
        options={options}
      />
    );
  }

  function renderTextarea(field: FieldName, placeholder?: string) {
    return (
      <TextareaField
        id={fieldId(field)}
        label={FIELD_LABELS[field]}
        value={form[field]}
        onChange={(value) => updateField(field, value)}
        onBlur={() => handleBlur(field)}
        error={fieldError(field)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-6">
      {/* Anti-spam honeypot */}
      <input
        type="text"
        name="website"
        value={form.website}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, website: e.target.value }))
        }
        tabIndex={-1}
        autoComplete="off"
        className={honeypotVariants()}
        aria-hidden="true"
      />

      <div className="space-y-4">
        <p className={sectionHeadingVariants()}>Data Siswa</p>

        <div className="grid gap-5 sm:grid-cols-2">
          {renderSelect("registration_type", REGISTRATION_TYPE_OPTIONS)}
          {renderSelect("gender", GENDER_OPTIONS)}
        </div>

        {renderText("full_name", { placeholder: "Nama lengkap siswa" })}

        <div className="grid gap-5 sm:grid-cols-2">
          {renderText("place_of_birth", { placeholder: "Tempat lahir" })}
          {renderText("date_of_birth", { type: "date" })}
        </div>

        {renderTextarea("current_address", "Alamat lengkap saat ini")}

        <div className="grid gap-5 sm:grid-cols-2">
          {renderSelect("physical_disability", PHYSICAL_DISABILITY_OPTIONS)}
          {renderText("previous_school", { placeholder: "Asal sekolah" })}
        </div>

        {renderText("nisn", { optional: true, placeholder: "Kalau sudah ada" })}
      </div>

      <div className="space-y-4">
        <p className={sectionHeadingVariants()}>Data Ayah</p>

        <div className="grid gap-5 sm:grid-cols-2">
          {renderSelect("father_status", PARENT_RELATIONSHIP_OPTIONS)}
          {renderText("father_name", { placeholder: "Nama ayah" })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {renderText("father_place_of_birth", {
            placeholder: "Tempat lahir ayah",
          })}
          {renderText("father_date_of_birth", { type: "date" })}
        </div>

        {renderText("father_phone", {
          type: "tel",
          inputMode: "numeric",
          autoComplete: "tel",
          placeholder: "081234567890",
        })}
      </div>

      <div className="space-y-4">
        <p className={sectionHeadingVariants()}>Data Ibu</p>

        <div className="grid gap-5 sm:grid-cols-2">
          {renderSelect("mother_status", PARENT_RELATIONSHIP_OPTIONS)}
          {renderText("mother_name", { placeholder: "Nama ibu" })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {renderText("mother_place_of_birth", {
            placeholder: "Tempat lahir ibu",
          })}
          {renderText("mother_date_of_birth", { type: "date" })}
        </div>

        {renderText("mother_phone", {
          type: "tel",
          inputMode: "numeric",
          autoComplete: "tel",
          placeholder: "081234567890",
        })}
      </div>

      <div className="space-y-4">
        <p className={sectionHeadingVariants()}>Kontak</p>

        {renderText("parent_email", {
          type: "email",
          inputMode: "email",
          autoComplete: "email",
          placeholder: "nama@email.com",
        })}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={submitButtonVariants()}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

        {isSubmitting ? "Mengirim..." : "Kirim pendaftaran"}
      </button>
    </form>
  );
}
