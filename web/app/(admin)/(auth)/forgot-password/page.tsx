"use client";

import { useState } from "react";
import { Clock, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthCard,
  AuthError,
  AuthIcon,
  AuthLoading,
  BackToLoginLink,
  authInputClassName,
} from "@/components/admin/auth/AuthCard";
import { forgotPassword } from "@/lib/api/account/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
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

  if (isSubmitted) {
    return (
      <AuthCard>
        <div className="flex flex-col items-center gap-3.5 text-center">
          <AuthIcon icon={Mail} tone="brand" />
          <h1 className="text-[22px] font-bold text-gray-900">Cek email</h1>
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 py-1 pr-3 pl-2.5 text-[13px] font-semibold text-gray-700">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span className="truncate">{email}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-500">
            <Clock className="h-4 w-4" />
            Berlaku 1 jam
          </span>
          <div className="pt-3">
            <BackToLoginLink />
          </div>
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
        <img
          src="/logo.png"
          alt="Logo SD Islam Darussalam Cikunir"
          className="h-14 w-14 rounded-full object-cover"
        />
        <h1 className="text-[22px] font-bold text-gray-900">Lupa Password</h1>

        <div className="w-full space-y-[18px]">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className={authInputClassName}
            />
          </div>

          {error && <AuthError message={error} />}

          <Button type="submit" className="h-11 w-full font-semibold">
            <Send className="h-4 w-4" />
            Kirim
          </Button>
        </div>

        <BackToLoginLink />
      </form>
    </AuthCard>
  );
}
