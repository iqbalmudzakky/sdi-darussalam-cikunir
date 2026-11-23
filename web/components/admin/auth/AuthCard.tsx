import type { ReactNode } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import type { LucideIcon } from "lucide-react";

type AuthCardProps = {
  children: ReactNode;
};

type AuthIconProps = {
  icon: LucideIcon;
  tone: "brand" | "danger";
};

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  isVisible: boolean;
  onChange: (value: string) => void;
  onToggleVisible: () => void;
};

const cardClassName =
  "w-full max-w-md rounded-2xl border border-gray-200 bg-white px-6 pt-9 pb-7 shadow-(--admin-card-shadow) sm:px-8";
const inputClassName =
  "h-11 rounded-lg px-3.5 focus-visible:border-brand-500 focus-visible:ring-brand-500/50";

const authIconVariants = cva(
  "flex h-[72px] w-[72px] items-center justify-center rounded-full",
  {
    variants: {
      tone: {
        brand: "bg-brand-100 text-brand-600",
        danger: "bg-red-50 text-red-600",
      },
    },
  },
);

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className={cardClassName}>{children}</div>
    </div>
  );
}

export function AuthIcon({ icon: Icon, tone }: AuthIconProps) {
  return (
    <span className={authIconVariants({ tone })}>
      <Icon className="h-9 w-9" />
    </span>
  );
}

export function AuthLoading() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
    </div>
  );
}

export function PasswordInput({
  id,
  label,
  value,
  placeholder,
  isVisible,
  onChange,
  onToggleVisible,
}: PasswordInputProps) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={isVisible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputClassName} pr-11`}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={isVisible ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {isVisible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-semibold text-red-700">
      <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
      {message}
    </p>
  );
}

export function BackToLoginLink() {
  return (
    <Link
      href="/masuk-sekolah"
      className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
    >
      <ArrowLeft className="h-4 w-4" />
      Kembali ke login
    </Link>
  );
}

export const authInputClassName = inputClassName;
