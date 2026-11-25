"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDateOnly, toDateOnly, formatNumericDate } from "@/lib/date";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/form/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/overlay/popover";
import { Calendar } from "@/components/ui/form/calendar";
import { SearchSelect } from "@/components/ui/form/search-select";

const fieldLabelVariants = cva(["mb-2 block text-sm font-medium text-ink-700"]);

export const fieldInputVariants = cva(
  [
    "w-full rounded-xl border bg-white",
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

const choiceButtonVariants = cva(
  [
    "cursor-pointer rounded-xl border px-3 py-3 text-[15px]",
    "transition-colors duration-200",
  ],
  {
    variants: {
      selected: {
        true: "border-brand-600 bg-brand-600 font-medium text-white",
        false: "border-brand-200 bg-white text-ink-700 hover:bg-brand-50",
      },
    },
  },
);

type FieldWrapperProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

function FieldWrapper({
  id,
  label,
  required,
  error,
  children,
}: FieldWrapperProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={fieldLabelVariants()}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {children}

      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
  endIcon?: React.ReactNode;
};

export function TextField({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  maxLength,
  endIcon,
}: TextFieldProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <div className="relative">
        <input
          id={id}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            fieldInputVariants({ invalid: Boolean(error) }),
            endIcon && "pr-10",
          )}
          placeholder={placeholder}
          maxLength={maxLength}
        />
        {endIcon && (
          <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-500">
            {endIcon}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  options: { value: string; label: string }[];
};

export function SelectField({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  options,
}: SelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <Select
        items={options}
        value={value || null}
        onValueChange={(newValue) => onChange(newValue ?? "")}
        onOpenChange={(open) => {
          if (!open) onBlur?.();
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            fieldInputVariants({ invalid: Boolean(error) }),
            "h-auto justify-between",
          )}
        >
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>

        <SelectContent className="rounded-xl border-brand-200">
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="data-highlighted:bg-brand-50 data-highlighted:text-brand-900"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

type ChoiceFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: { value: string; label: string }[];
};

export function ChoiceField({
  id,
  label,
  required,
  value,
  onChange,
  error,
  options,
}: ChoiceFieldProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <div
        id={id}
        role="radiogroup"
        aria-invalid={Boolean(error)}
        aria-label={label}
        className="grid grid-cols-2 gap-2"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={choiceButtonVariants({
              selected: value === option.value,
            })}
          >
            {option.label}
          </button>
        ))}
      </div>
    </FieldWrapper>
  );
}

type SearchSelectFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  options: { value: string; label: string }[];
  disabled?: boolean;
};

export function SearchSelectField({
  id,
  label,
  required,
  value,
  onChange,
  error,
  options,
  disabled,
}: SearchSelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <SearchSelect
        id={id}
        value={value}
        options={options}
        onValueChange={onChange}
        disabled={disabled}
        invalid={Boolean(error)}
        className={fieldInputVariants({ invalid: Boolean(error) })}
      />
    </FieldWrapper>
  );
}

type DateFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  minDate?: Date;
};

export function DateField({
  id,
  label,
  required,
  value,
  onChange,
  onBlur,
  error,
  defaultMonth,
  startMonth,
  endMonth,
  minDate,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const disabledDays = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(endMonth ? [{ after: endMonth }] : []),
  ];

  const selected = parseDateOnly(value);

  return (
    <FieldWrapper id={id} label={label} required={required} error={error}>
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);

          if (!open) onBlur?.();
        }}
      >
        <PopoverTrigger
          id={id}
          type="button"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            fieldInputVariants({ invalid: Boolean(error) }),
            "flex cursor-pointer items-center justify-between gap-2 text-left",
          )}
        >
          <span className={cn("truncate", !selected && "text-ink-500/70")}>
            {selected ? formatNumericDate(selected) : "Pilih tanggal"}
          </span>

          <CalendarDays
            className="h-4 w-4 shrink-0 text-ink-500"
            aria-hidden="true"
          />
        </PopoverTrigger>

        <PopoverContent className="border-brand-200">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selected}
            defaultMonth={selected ?? defaultMonth}
            startMonth={startMonth}
            endMonth={endMonth}
            disabled={disabledDays}
            onSelect={(date) => {
              onChange(date ? toDateOnly(date) : "");

              if (date) setIsOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}

type TextareaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  rows?: number;
};

export function TextareaField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  rows = 3,
}: TextareaFieldProps) {
  return (
    <FieldWrapper id={id} label={label} error={error}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          fieldInputVariants({ invalid: Boolean(error) }),
          "resize-none",
        )}
        placeholder={placeholder}
      />
    </FieldWrapper>
  );
}

const formSectionHeadingVariants = cva([
  "mb-4 border-b border-brand-200 pb-2",
  "text-[11px] font-medium tracking-[0.18em] text-brand-600 uppercase",
]);

type FormSectionProps = {
  title: string;
  children: React.ReactNode;
};

export function FormSection({ title, children }: FormSectionProps) {
  return (
    <section>
      <h3 className={formSectionHeadingVariants()}>{title}</h3>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}
