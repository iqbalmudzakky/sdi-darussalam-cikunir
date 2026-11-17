"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuthCard,
  AuthError,
  AuthIcon,
  AuthLoading,
  BackToLoginLink,
  PasswordInput,
} from "./AuthCard";
import type { LucideIcon } from "lucide-react";

type SetPasswordResult =
  | { ok: true }
  | { ok: false; error: string; reason?: "invalid_token" | "expired" };

type SetPasswordFormProps = {
  icon: LucideIcon;
  title: string;
  linkProblemAction: ReactNode;
  onSubmit: (password: string) => Promise<SetPasswordResult>;
};

export function SetPasswordForm({
  icon,
  title,
  linkProblemAction,
  onSubmit,
}: SetPasswordFormProps) {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");
  const [linkProblem, setLinkProblem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password tidak sama");
      return;
    }

    setIsLoading(true);
    try {
      const result = await onSubmit(password);
      if (!result.ok && result.reason === "expired") {
        setLinkProblem("Link expired");
        return;
      }
      if (!result.ok && result.reason === "invalid_token") {
        setLinkProblem("Link tidak valid");
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Gagal terhubung ke server");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <AuthCard>
        <AuthLoading />
      </AuthCard>
    );
  }

  if (linkProblem) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center gap-[18px] text-center">
          <AuthIcon icon={Clock} tone="danger" />
          <h1 className="text-[22px] font-bold text-gray-900">{linkProblem}</h1>
          {linkProblemAction}
          <BackToLoginLink />
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-[18px]"
      >
        <AuthIcon icon={icon} tone="brand" />
        <h1 className="text-[22px] font-bold text-gray-900">{title}</h1>

        <div className="w-full space-y-[18px]">
          <PasswordInput
            id="password"
            label="Password"
            value={password}
            placeholder="Minimal 8 karakter"
            isVisible={isVisible}
            onChange={setPassword}
            onToggleVisible={() => setIsVisible((prev) => !prev)}
          />
          <PasswordInput
            id="confirm-password"
            label="Ulangi password"
            value={confirmPassword}
            placeholder="••••••••"
            isVisible={isVisible}
            onChange={setConfirmPassword}
            onToggleVisible={() => setIsVisible((prev) => !prev)}
          />

          {error && <AuthError message={error} />}

          <Button type="submit" className="h-11 w-full font-semibold">
            <Check className="h-4 w-4" />
            Simpan
          </Button>
        </div>

        <BackToLoginLink />
      </form>
    </AuthCard>
  );
}
