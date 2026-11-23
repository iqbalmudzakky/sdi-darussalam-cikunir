"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import {
  EDUCATION_OPTIONS,
  INCOME_RANGE_OPTIONS,
  OCCUPATION_OPTIONS,
  SPECIAL_NEEDS_OPTIONS,
} from "@/lib/registrationOptions";
import { cn } from "@/lib/utils";
import type { FullFormController } from "@/types/registration/Registration";
import {
  BoundChoiceField,
  BoundSelectField,
  BoundTextField,
} from "./BoundFields";

type ParentPanelKey = "father" | "mother" | "guardian";

const panelVariants = cva("rounded-xl border bg-white", {
  variants: {
    hasError: {
      true: "border-amber-300",
      false: "border-brand-100",
    },
  },
});

type ParentsStepProps = {
  form: FullFormController;
};

export function ParentsStep({ form }: ParentsStepProps) {
  const [openPanel, setOpenPanel] = useState<ParentPanelKey | null>("father");
  const panels = [
    { key: "father", title: "Ayah", optional: false },
    { key: "mother", title: "Ibu", optional: false },
    { key: "guardian", title: "Wali", optional: true },
  ] as const;

  return (
    <div className="space-y-3">
      {panels.map((panel) => {
        const isOpen = openPanel === panel.key;
        const hasError = Object.entries(form.fieldErrors).some(
          ([key, message]) => message && key.startsWith(`${panel.key}.`),
        );

        return (
          <section key={panel.key} className={panelVariants({ hasError })}>
            <button
              type="button"
              onClick={() => setOpenPanel(isOpen ? null : panel.key)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center gap-2 px-4 py-3.5 text-left"
            >
              <span className="flex-1 font-semibold text-ink-900">
                {panel.title}
              </span>
              {panel.optional && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-ink-500">
                  Opsional
                </span>
              )}
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-ink-500 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <div className="space-y-4 px-4 pb-4">
                {panel.key === "guardian" ? (
                  <GuardianFields form={form} />
                ) : (
                  <ParentFields form={form} section={panel.key} />
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

type ParentFieldsProps = {
  form: FullFormController;
  section: "father" | "mother";
};

function ParentFields({ form, section }: ParentFieldsProps) {
  return (
    <>
      <BoundTextField form={form} section={section} field="name" label="Nama" />
      <BoundTextField
        form={form}
        section={section}
        field="nik"
        label="NIK"
        placeholder="16 digit"
        inputMode="numeric"
        maxLength={16}
      />
      <BoundTextField
        form={form}
        section={section}
        field="birth_year"
        label="Tahun lahir"
        placeholder="1985"
        inputMode="numeric"
        maxLength={4}
      />
      <BoundChoiceField
        form={form}
        section={section}
        field="special_needs"
        label="Berkebutuhan khusus"
        options={SPECIAL_NEEDS_OPTIONS}
      />
      <BoundSelectField
        form={form}
        section={section}
        field="occupation"
        label="Pekerjaan"
        options={OCCUPATION_OPTIONS}
      />
      <BoundSelectField
        form={form}
        section={section}
        field="education"
        label="Pendidikan"
        options={EDUCATION_OPTIONS}
      />
      <BoundSelectField
        form={form}
        section={section}
        field="income_range"
        label="Penghasilan per bulan"
        options={INCOME_RANGE_OPTIONS}
      />
      <BoundTextField
        form={form}
        section={section}
        field="phone"
        label="No. WhatsApp (opsional)"
        placeholder="08xxxxxxxxxx"
        inputMode="tel"
      />
    </>
  );
}

function GuardianFields({ form }: { form: FullFormController }) {
  return (
    <>
      <BoundTextField
        form={form}
        section="guardian"
        field="name"
        label="Nama wali"
      />
      <BoundTextField
        form={form}
        section="guardian"
        field="birth_year"
        label="Tahun lahir"
        placeholder="1985"
        inputMode="numeric"
        maxLength={4}
      />
      <BoundSelectField
        form={form}
        section="guardian"
        field="occupation"
        label="Pekerjaan"
        options={OCCUPATION_OPTIONS}
      />
      <BoundSelectField
        form={form}
        section="guardian"
        field="education"
        label="Pendidikan"
        options={EDUCATION_OPTIONS}
      />
      <BoundSelectField
        form={form}
        section="guardian"
        field="income_range"
        label="Penghasilan per bulan"
        options={INCOME_RANGE_OPTIONS}
      />
    </>
  );
}
