"use client";

import { useState } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthCard,
  AuthError,
  AuthLoading,
  PasswordInput,
  authInputClassName,
} from "@/components/admin/auth/AuthCard";
import { login } from "@/lib/api/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal login.";
      setIsLoading(false);
      setError(message);
      return;
    }

    window.location.replace("/dashboard");
  }

  if (isLoading) {
    return (
      <AuthCard>
        <AuthLoading />
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
        <h1 className="text-[22px] font-bold text-gray-900">Masuk</h1>

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

          <div className="space-y-2">
            <PasswordInput
              id="password"
              label="Password"
              value={password}
              placeholder="••••••••"
              isVisible={isVisible}
              onChange={setPassword}
              onToggleVisible={() => setIsVisible((prev) => !prev)}
            />
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[13px] font-semibold text-brand-600 hover:underline"
              >
                Lupa password?
              </Link>
            </div>
          </div>

          {error && <AuthError message={error} />}

          <Button type="submit" className="h-11 w-full font-semibold">
            <LogIn className="h-4 w-4" />
            Masuk
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
