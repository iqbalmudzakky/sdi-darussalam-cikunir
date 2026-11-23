import type { HTMLAttributes } from "react";
import {
  ChoiceField,
  SearchSelectField,
  SelectField,
  TextField,
} from "@/components/sections/RegistrationForm/fields";
import { PhoneField } from "@/components/sections/RegistrationForm/PhoneField";
import type {
  FullFormController,
  FullFormSection,
} from "@/types/registration/Registration";

type BoundFieldProps = {
  form: FullFormController;
  section: FullFormSection;
  field: string;
  label: string;
  required?: boolean;
};

type BoundTextFieldProps = BoundFieldProps & {
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
};

type BoundOptionFieldProps = BoundFieldProps & {
  options: { value: string; label: string }[];
  searchable?: boolean;
};

export function BoundTextField({
  form,
  section,
  field,
  label,
  required,
  placeholder,
  inputMode,
  maxLength,
}: BoundTextFieldProps) {
  return (
    <TextField
      id={`${section}-${field}`}
      label={label}
      required={required}
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
  required,
  options,
  searchable,
}: BoundOptionFieldProps) {
  const Field = searchable ? SearchSelectField : SelectField;

  return (
    <Field
      id={`${section}-${field}`}
      label={label}
      required={required}
      options={options}
      value={readValue(form, section, field)}
      onChange={(value) => form.setSectionField(section, field, value)}
      error={form.fieldErrors[`${section}.${field}`]}
    />
  );
}

export function BoundPhoneField({
  form,
  section,
  field,
  label,
  required,
}: BoundFieldProps) {
  return (
    <PhoneField
      id={`${section}-${field}`}
      label={label}
      required={required}
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
  required,
  options,
}: BoundOptionFieldProps) {
  return (
    <ChoiceField
      id={`${section}-${field}`}
      label={label}
      required={required}
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
