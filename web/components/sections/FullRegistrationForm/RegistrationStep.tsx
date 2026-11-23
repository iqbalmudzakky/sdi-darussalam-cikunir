"use client";

import {
  FormSection,
  SelectField,
} from "@/components/sections/RegistrationForm/fields";
import {
  REGISTRATION_JENIS_OPTIONS,
  REGISTRATION_PROGRAM_OPTIONS,
} from "@/lib/registrationOptions";
import type { FullFormController } from "@/types/registration/Registration";
import {
  BoundChoiceField,
  BoundPhoneField,
  BoundSelectField,
  BoundTextField,
} from "./BoundFields";

export function RegistrationStep({ form }: { form: FullFormController }) {
  const registration = form.values.registration;
  const academicYearOptions = form.academicYears.map((year) => ({
    value: year,
    label: year,
  }));
  const targetGradeOptions = form.targetGrades.map((grade) => ({
    value: String(grade),
    label: `Kelas ${grade}`,
  }));

  return (
    <div className="space-y-8">
      <FormSection title="Pendaftaran">
        <BoundChoiceField
          form={form}
          section="registration"
          field="registration_type"
          label="Daftar sebagai"
          options={REGISTRATION_JENIS_OPTIONS}
          required
        />
        <SelectField
          id="registration-academic_year"
          label="Masuk tahun ajaran"
          options={academicYearOptions}
          value={form.academicYear}
          onChange={(value) =>
            form.setSectionField("registration", "academic_year", value)
          }
          error={form.fieldErrors["registration.academic_year"]}
          required
        />
        <BoundChoiceField
          form={form}
          section="registration"
          field="program"
          label="Program"
          options={REGISTRATION_PROGRAM_OPTIONS}
          required
        />
        {registration.registration_type === "pindahan" && (
          <BoundSelectField
            form={form}
            section="registration"
            field="target_grade"
            label="Kelas tujuan"
            options={targetGradeOptions}
            required
          />
        )}
      </FormSection>

      <FormSection title="Kontak orang tua">
        <BoundTextField
          form={form}
          section="registration"
          field="contact_name"
          label="Nama orang tua"
          required
        />
        <BoundPhoneField
          form={form}
          section="registration"
          field="contact_phone"
          label="No. WhatsApp"
          required
        />
      </FormSection>
    </div>
  );
}
