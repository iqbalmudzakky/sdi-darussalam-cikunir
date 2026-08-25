import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const fieldLabelVariants = cva(["mb-2 block text-sm font-medium text-ink-700"]);

export const fieldInputVariants = cva(["w-full rounded-xl border bg-white", "px-3.5 py-3", "text-[15px] text-ink-900", "placeholder:text-ink-500/70", "outline-none", "transition-colors duration-200"], {
  variants: {
    invalid: {
      true: "border-red-400 focus:border-red-500",
      false: "border-brand-200 focus:border-brand-500",
    },
  },
  defaultVariants: {
    invalid: false,
  },
});

type FieldWrapperProps = {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
};

function FieldWrapper({ id, label, optional, error, children }: FieldWrapperProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={fieldLabelVariants()}>
        {label}{" "}
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
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  optional?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
};

export function TextField({ id, label, value, onChange, onBlur, error, optional, type = "text", placeholder, autoComplete, inputMode, maxLength }: TextFieldProps) {
  return (
    <FieldWrapper id={id} label={label} optional={optional} error={error}>
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
        className={fieldInputVariants({ invalid: Boolean(error) })}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  options: { value: string; label: string }[];
};

export function SelectField({ id, label, value, onChange, onBlur, error, options }: SelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label} error={error}>
      <Select
        items={options}
        value={value || null}
        onValueChange={(newValue) => onChange(newValue ?? "")}
        onOpenChange={(open) => {
          if (!open) onBlur?.();
        }}
      >
        <SelectTrigger id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} className={cn(fieldInputVariants({ invalid: Boolean(error) }), "h-auto justify-between")}>
          <SelectValue placeholder="Pilih" />
        </SelectTrigger>

        <SelectContent className="rounded-xl border-brand-200">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="data-highlighted:bg-brand-50 data-highlighted:text-brand-900">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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

export function TextareaField({ id, label, value, onChange, onBlur, error, placeholder, rows = 3 }: TextareaFieldProps) {
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
        className={cn(fieldInputVariants({ invalid: Boolean(error) }), "resize-none")}
        placeholder={placeholder}
      />
    </FieldWrapper>
  );
}
