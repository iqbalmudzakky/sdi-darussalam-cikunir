"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Clock, KeyRound, Send, UserPlus, Users } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { acceptInvite, resetPassword } from "@/lib/api/account/auth";
import {
  AuthCard,
  AuthError,
  AuthIcon,
  AuthLoading,
  BackToLoginLink,
  PasswordInput,
} from "./AuthCard";

type LinkStatus = "valid" | "invalid_token" | "expired";

type SetPasswordFormProps = {
  purpose: "invite" | "reset";
  token: string;
  initialStatus: LinkStatus;
};

const PURPOSE_CONFIG = {
  invite: { icon: UserPlus, title: "Buat password", submit: acceptInvite },
  reset: { icon: KeyRound, title: "Password baru", submit: resetPassword },
};

const LINK_PROBLEM_TITLE: Record<Exclude<LinkStatus, "valid">, string> = {
  expired: "Link expired",
  invalid_token: "Link tidak valid",
};

export function SetPasswordForm({
  purpose,
  token,
  initialStatus,
}: SetPasswordFormProps) {
  const router = useRouter();
  const config = PURPOSE_CONFIG[purpose];

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState("");
  const [linkStatus, setLinkStatus] = useState<LinkStatus>(initialStatus);
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
      const result = await config.submit(token, password);
      if (result.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setIsLoading(false);
      if (result.reason) {
        setLinkStatus(result.reason);
        return;
      }
      setError(result.error);
    } catch {
      setIsLoading(false);
      setError("Gagal terhubung ke server");
    }
  }

  if (isLoading) {
    return (
      <AuthCard>
        <AuthLoading />
      </AuthCard>
    );
  }

  if (linkStatus !== "valid") {
    return (
      <AuthCard>
        <div className="flex flex-col items-center gap-[18px] text-center">
          <AuthIcon icon={Clock} tone="danger" />
          <h1 className="text-[22px] font-bold text-gray-900">
            {LINK_PROBLEM_TITLE[linkStatus]}
          </h1>
          {purpose === "reset" ? (
            <Link
              href="/forgot-password"
              className={buttonVariants({
                className: "h-11 w-full font-semibold",
              })}
            >
              <Send className="h-4 w-4" />
              Minta link baru
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1.5 pr-3.5 pl-3 text-[13px] font-semibold text-brand-700">
              <Users className="h-4 w-4" />
              Minta undangan baru ke Kepsek
            </span>
          )}
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
        <AuthIcon icon={config.icon} tone="brand" />
        <h1 className="text-[22px] font-bold text-gray-900">{config.title}</h1>

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
