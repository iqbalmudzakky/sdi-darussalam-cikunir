import type { HTMLAttributes } from "react";
import {
  ChoiceField,
  SelectField,
  TextField,
} from "@/components/sections/RegistrationForm/fields";
import type {
  FullFormController,
  FullFormSection,
} from "@/types/registration/Registration";

type BoundFieldProps = {
  form: FullFormController;
  section: FullFormSection;
  field: string;
  label: string;
};

type BoundTextFieldProps = BoundFieldProps & {
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
};

type BoundOptionFieldProps = BoundFieldProps & {
  options: { value: string; label: string }[];
};

export function BoundTextField({
  form,
  section,
  field,
  label,
  placeholder,
  inputMode,
  maxLength,
}: BoundTextFieldProps) {
  return (
    <TextField
      id={`${section}-${field}`}
      label={label}
      placeholder={placeholder}
      inputMode={inputMode}
      maxLength={maxLength}
      value={readValue(form, section, field)}
      onChange={(value) => form.setSectionField(section, field, value)}
      error={form.fieldErrors[`${section}.${field}`]}
    />
  );
}

export function BoundSelectField({
  form,
  section,
  field,
  label,
  options,
}: BoundOptionFieldProps) {
  return (
    <SelectField
      id={`${section}-${field}`}
      label={label}
      options={options}
      value={readValue(form, section, field)}
      onChange={(value) => form.setSectionField(section, field, value)}
      error={form.fieldErrors[`${section}.${field}`]}
    />
  );
}

export function BoundChoiceField({
  form,
  section,
  field,
  label,
  options,
}: BoundOptionFieldProps) {
  return (
    <ChoiceField
      id={`${section}-${field}`}
      label={label}
      options={options}
      value={readValue(form, section, field)}
      onChange={(value) => form.setSectionField(section, field, value)}
      error={form.fieldErrors[`${section}.${field}`]}
    />
  );
}

function readValue(
  form: FullFormController,
  section: FullFormSection,
  field: string,
): string {
  const values = form.values[section] as Record<string, string>;
  return values[field] ?? "";
}
