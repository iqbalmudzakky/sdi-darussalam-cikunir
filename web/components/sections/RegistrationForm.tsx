"use client";

import { useState, type FormEvent } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitRegistration } from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";

const fieldLabelVariants = cva(["mb-2 block text-sm font-medium text-ink-700"]);

const honeypotVariants = cva([
  "absolute -left-2499.75 top-auto h-px w-px overflow-hidden",
]);

const fieldInputVariants = cva(
  [
    "w-full border bg-white",
    "px-3.5 py-3",
    "text-[15px] text-ink-900",
    "placeholder:text-ink-500/70",
    "outline-none",
    "transition-colors duration-200",
  ],
  {
    variants: {
      invalid: {
        true: "border-red-400 focus:border-red-500",
        false: "border-brand-200 focus:border-brand-500",
      },
    },
    defaultVariants: {
      invalid: false,
    },
  },
);

const submitButtonVariants = cva([
  "flex w-full cursor-pointer items-center justify-center gap-2",
  "bg-brand-600 px-5 py-3.5",
  "font-medium text-white",
  "transition-colors duration-200",
  "hover:bg-brand-700",
  "disabled:cursor-not-allowed disabled:opacity-60",
]);

const EMPTY_FORM = {
  parent_name: "",
  student_name: "",
  whatsapp: "",
  email: "",
  message: "",
  website: "",
};

type FormFields = typeof EMPTY_FORM;
type FieldName = keyof Omit<FormFields, "website">;
type FieldErrors = Partial<Record<FieldName, string>>;

/*
 * Nama orang: huruf, spasi, apostrof, titik, tanda hubung.
 * Angka dan simbol lain tidak diterima.
 */
const PERSON_NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/*
 * Nomor telepon hanya menyimpan digit.
 *
 * Pemisah seperti spasi dan tanda hubung dibuang,
 * awalan +62 atau 62 dinormalkan menjadi 0.
 */
function normalizeWhatsapp(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.startsWith("62")) {
    return `0${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.startsWith("8")) {
    return `0${digitsOnly}`;
  }

  return digitsOnly;
}

function validateField(field: FieldName, value: string): string | undefined {
  const trimmed = value.trim();

  switch (field) {
    case "parent_name":
    case "student_name": {
      const label =
        field === "parent_name" ? "Nama orang tua" : "Nama calon siswa";

      if (!trimmed) return `${label} wajib diisi.`;
      if (trimmed.length < 3) return `${label} minimal 3 karakter.`;
      if (trimmed.length > 80) return `${label} maksimal 80 karakter.`;
      if (!PERSON_NAME_PATTERN.test(trimmed)) {
        return `${label} hanya boleh berisi huruf.`;
      }
      return undefined;
    }

    case "whatsapp": {
      if (!trimmed) return "Nomor WhatsApp wajib diisi.";

      const normalized = normalizeWhatsapp(trimmed);

      if (!/^0\d{9,13}$/.test(normalized)) {
        return "Nomor WhatsApp tidak valid. Contoh: 081234567890.";
      }
      return undefined;
    }

    case "email": {
      if (!trimmed) return "Email wajib diisi.";
      if (!EMAIL_PATTERN.test(trimmed)) return "Format email tidak valid.";
      return undefined;
    }

    case "message": {
      if (trimmed.length > 1000) return "Pesan maksimal 1000 karakter.";
      return undefined;
    }
  }
}

const REQUIRED_FIELDS: FieldName[] = [
  "parent_name",
  "student_name",
  "whatsapp",
  "email",
  "message",
];

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
    /*
     * Kolom nomor menolak karakter non-digit saat diketik,
     * kecuali pemisah dan awalan + yang lazim ikut tersalin
     * dari daftar kontak.
     */
    const value =
      field === "whatsapp" ? rawValue.replace(/[^\d+\s()-]/g, "") : rawValue;

    setForm((prev) => ({ ...prev, [field]: value }));

    /*
     * Pesan error hanya diperbarui kalau kolom sudah pernah
     * ditinggalkan, supaya user tidak disalahkan di tengah
     * pengetikan.
     */
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
      whatsapp: normalizeWhatsapp(form.whatsapp),
    });

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

  return (
    <form onSubmit={handleSubmit} noValidate className="min-w-0 space-y-5">
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

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Nama orang tua */}
        <div className="min-w-0">
          <label htmlFor="reg-parent-name" className={fieldLabelVariants()}>
            Nama orang tua
          </label>

          <input
            id="reg-parent-name"
            type="text"
            autoComplete="name"
            maxLength={80}
            value={form.parent_name}
            onChange={(e) => updateField("parent_name", e.target.value)}
            onBlur={() => handleBlur("parent_name")}
            aria-invalid={Boolean(fieldError("parent_name"))}
            aria-describedby={
              fieldError("parent_name") ? "reg-parent-name-error" : undefined
            }
            className={fieldInputVariants({
              invalid: Boolean(fieldError("parent_name")),
            })}
            placeholder="Nama lengkap"
          />

          {fieldError("parent_name") && (
            <p
              id="reg-parent-name-error"
              className="mt-1.5 text-xs text-red-600"
            >
              {fieldError("parent_name")}
            </p>
          )}
        </div>

        {/* Nama calon siswa */}
        <div className="min-w-0">
          <label htmlFor="reg-student-name" className={fieldLabelVariants()}>
            Nama calon siswa
          </label>

          <input
            id="reg-student-name"
            type="text"
            maxLength={80}
            value={form.student_name}
            onChange={(e) => updateField("student_name", e.target.value)}
            onBlur={() => handleBlur("student_name")}
            aria-invalid={Boolean(fieldError("student_name"))}
            aria-describedby={
              fieldError("student_name") ? "reg-student-name-error" : undefined
            }
            className={fieldInputVariants({
              invalid: Boolean(fieldError("student_name")),
            })}
            placeholder="Nama lengkap anak"
          />

          {fieldError("student_name") && (
            <p
              id="reg-student-name-error"
              className="mt-1.5 text-xs text-red-600"
            >
              {fieldError("student_name")}
            </p>
          )}
        </div>

        {/* WhatsApp */}
        <div className="min-w-0">
          <label htmlFor="reg-whatsapp" className={fieldLabelVariants()}>
            Nomor WhatsApp
          </label>

          <input
            id="reg-whatsapp"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={20}
            value={form.whatsapp}
            onChange={(e) => updateField("whatsapp", e.target.value)}
            onBlur={() => handleBlur("whatsapp")}
            aria-invalid={Boolean(fieldError("whatsapp"))}
            aria-describedby={
              fieldError("whatsapp") ? "reg-whatsapp-error" : undefined
            }
            className={fieldInputVariants({
              invalid: Boolean(fieldError("whatsapp")),
            })}
            placeholder="081234567890"
          />

          {fieldError("whatsapp") && (
            <p id="reg-whatsapp-error" className="mt-1.5 text-xs text-red-600">
              {fieldError("whatsapp")}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="min-w-0">
          <label htmlFor="reg-email" className={fieldLabelVariants()}>
            Email
          </label>

          <input
            id="reg-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={120}
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            aria-invalid={Boolean(fieldError("email"))}
            aria-describedby={
              fieldError("email") ? "reg-email-error" : undefined
            }
            className={fieldInputVariants({
              invalid: Boolean(fieldError("email")),
            })}
            placeholder="nama@email.com"
          />

          {fieldError("email") && (
            <p id="reg-email-error" className="mt-1.5 text-xs text-red-600">
              {fieldError("email")}
            </p>
          )}
        </div>
      </div>

      {/* Pesan */}
      <div className="min-w-0">
        <label htmlFor="reg-message" className={fieldLabelVariants()}>
          Pesan <span className="font-normal text-ink-500">(opsional)</span>
        </label>

        <textarea
          id="reg-message"
          rows={4}
          maxLength={1000}
          value={form.message}
          onChange={(e) => updateField("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          aria-invalid={Boolean(fieldError("message"))}
          className={cn(
            fieldInputVariants({ invalid: Boolean(fieldError("message")) }),
            "resize-none",
          )}
          placeholder="Pertanyaan seputar pendaftaran, biaya, atau jadwal kunjungan"
        />

        {fieldError("message") && (
          <p className="mt-1.5 text-xs text-red-600">{fieldError("message")}</p>
        )}
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
