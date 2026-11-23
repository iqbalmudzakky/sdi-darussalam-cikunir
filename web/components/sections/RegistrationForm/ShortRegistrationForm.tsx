"use client";

import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { AlertTriangle, Loader2, MessageCircle, Send } from "lucide-react";
import { useShortRegistrationForm } from "@/hooks/useRegistrations";
import {
  GENDER_OPTIONS,
  REGISTRATION_PROGRAM_OPTIONS,
} from "@/lib/registrationOptions";
import type {
  RegistrationType,
  ShortRegistrationReceipt,
} from "@/types/registration/Registration";
import { ChoiceField, DateField, SelectField, TextField } from "./fields";
import { PhoneField } from "./PhoneField";

const sectionHeadingVariants = cva([
  "border-b border-brand-200 pb-2",
  "text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase",
]);

const submitButtonVariants = cva([
  "flex w-full cursor-pointer items-center justify-center gap-2",
  "rounded-xl bg-brand-600 px-5 py-3.5 font-medium text-white",
  "transition-colors duration-200 hover:bg-brand-700",
  "disabled:cursor-not-allowed disabled:opacity-60",
]);

const noticeVariants = cva([
  "flex items-center gap-2.5 rounded-xl border border-amber-200",
  "bg-amber-50 px-3 py-2.5",
]);

const noticeLinkVariants = cva([
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
  "bg-green-600 text-white transition-colors hover:bg-green-700",
]);

type ShortRegistrationFormProps = {
  registrationType: RegistrationType;
  onSubmitted: (receipt: ShortRegistrationReceipt) => void;
};

export function ShortRegistrationForm({
  registrationType,
  onSubmitted,
}: ShortRegistrationFormProps) {
  const formInput = { registrationType, onSubmitted };
  const form = useShortRegistrationForm(formInput);
  const { values, fieldErrors, setField } = form;

  const today = new Date();
  const birthStartMonth = new Date(today.getFullYear() - 15, 0);
  const birthDefaultMonth = new Date(today.getFullYear() - 6, 0);

  const academicYearOptions = form.academicYears.map((year) => ({
    value: year,
    label: year,
  }));
  const targetGradeOptions = form.targetGrades.map((grade) => ({
    value: String(grade),
    label: `Kelas ${grade}`,
  }));

  return (
    <form onSubmit={form.handleSubmit} noValidate className="space-y-4">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={values.website}
        onChange={(event) => setField("website", event.target.value)}
        className="absolute -left-2499.75 h-px w-px overflow-hidden"
      />

      <h3 className={sectionHeadingVariants()}>Anak</h3>

      <TextField
        id="short-full-name"
        label="Nama lengkap anak"
        placeholder="Sesuai akta kelahiran"
        autoComplete="off"
        value={values.full_name}
        onChange={(value) => setField("full_name", value)}
        error={fieldErrors.full_name}
      />

      <ChoiceField
        id="short-gender"
        label="Jenis kelamin"
        options={GENDER_OPTIONS}
        value={values.gender}
        onChange={(value) => setField("gender", value)}
        error={fieldErrors.gender}
      />

      <DateField
        id="short-birth-date"
        label="Tanggal lahir"
        startMonth={birthStartMonth}
        endMonth={today}
        defaultMonth={birthDefaultMonth}
        value={values.date_of_birth}
        onChange={(value) => setField("date_of_birth", value)}
        error={fieldErrors.date_of_birth}
      />

      {form.underAge && (
        <WhatsAppNotice
          whatsappUrl={form.underAge.whatsapp_url}
          linkLabel="Tanya panitia lewat WhatsApp"
        >
          <span className="block font-semibold">
            Usia di bawah {form.underAge.minimum_years} tahun per 1 Juli{" "}
            {form.underAge.cutoff_year}
          </span>
          Tanya panitia
        </WhatsAppNotice>
      )}

      <TextField
        id="short-previous-school"
        label="Asal sekolah"
        placeholder={
          registrationType === "pindahan" ? "Nama sekolah asal" : "TK / PAUD"
        }
        value={values.previous_school}
        onChange={(value) => setField("previous_school", value)}
        error={fieldErrors.previous_school}
        maxLength={120}
      />

      {targetGradeOptions.length > 0 && (
        <SelectField
          id="short-target-grade"
          label="Kelas tujuan"
          options={targetGradeOptions}
          value={values.target_grade}
          onChange={(value) => setField("target_grade", value)}
          error={fieldErrors.target_grade}
        />
      )}

      <ChoiceField
        id="short-program"
        label="Program"
        options={REGISTRATION_PROGRAM_OPTIONS}
        value={values.program}
        onChange={(value) => setField("program", value)}
        error={fieldErrors.program}
      />

      <SelectField
        id="short-academic-year"
        label="Masuk tahun ajaran"
        options={academicYearOptions}
        value={form.academicYear}
        onChange={(value) => setField("academic_year", value)}
        error={fieldErrors.academic_year}
      />

      <h3 className={sectionHeadingVariants()}>Orang tua</h3>

      <TextField
        id="short-contact-name"
        label="Nama orang tua"
        placeholder="Ayah atau ibu"
        autoComplete="name"
        value={values.contact_name}
        onChange={(value) => setField("contact_name", value)}
        error={fieldErrors.contact_name}
      />

      <PhoneField
        id="short-contact-phone"
        label="No. WhatsApp"
        value={values.contact_phone}
        onChange={(value) => setField("contact_phone", value)}
        error={fieldErrors.contact_phone}
      />

      <TextField
        id="short-parent-email"
        label="Email (opsional)"
        placeholder="nama@email.com"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={values.parent_email}
        onChange={(value) => setField("parent_email", value)}
        error={fieldErrors.parent_email}
      />

      {form.submitError && form.submitWhatsAppUrl && (
        <WhatsAppNotice
          whatsappUrl={form.submitWhatsAppUrl}
          linkLabel="Hubungi panitia lewat WhatsApp"
        >
          <span className="font-semibold">{form.submitError}</span>
        </WhatsAppNotice>
      )}

      {form.submitError && !form.submitWhatsAppUrl && (
        <p role="alert" className="text-center text-sm text-red-600">
          {form.submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={form.isSubmitting}
        className={submitButtonVariants()}
      >
        {form.isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Kirim
      </button>
    </form>
  );
}

type WhatsAppNoticeProps = {
  whatsappUrl: string | null;
  linkLabel: string;
  children: ReactNode;
};

function WhatsAppNotice({
  whatsappUrl,
  linkLabel,
  children,
}: WhatsAppNoticeProps) {
  return (
    <div role="alert" className={noticeVariants()}>
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
      <p className="min-w-0 flex-1 text-xs leading-snug text-amber-800">
        {children}
      </p>
      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={linkLabel}
          className={noticeLinkVariants()}
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
