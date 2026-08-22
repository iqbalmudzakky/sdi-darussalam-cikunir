"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cva } from "class-variance-authority";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const pageBackgroundVariants = cva([
  "relative min-h-screen overflow-hidden",
  "flex items-center justify-center",
]);

const pageGradientVariants = cva([
  "absolute inset-0",
  "bg-linear-to-br from-emerald-50 via-teal-50 to-green-50",
]);

const inputFieldVariants = cva([
  "h-11 rounded-xl px-4",
  "focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50",
]);

const togglePasswordVariants = cva([
  "absolute right-1 top-1/2 -translate-y-1/2",
  "text-gray-400 hover:bg-transparent hover:text-gray-600",
]);

const errorBoxVariants = cva([
  "rounded-xl border border-red-100 bg-red-50 px-4 py-3",
  "text-sm text-red-600",
]);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
    } catch {
      setIsLoading(false);
      setError("Email atau password salah.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className={pageBackgroundVariants()}>
      <div className={pageGradientVariants()}></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-500">Memproses login...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-8">
                <img
                  src="/logo.png"
                  alt="Logo SDI Darussalam Cikunir"
                  className="w-14 h-14 mb-4 rounded-full object-cover"
                />
                <h1 className="text-xl font-bold text-gray-900">
                  SDI Darussalam Cikunir
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Masuk ke panel admin untuk kelola konten website
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sdidarussalam.sch.id"
                    className={inputFieldVariants()}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={cn(inputFieldVariants(), "pr-11")}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={
                        showPassword
                          ? "Sembunyikan password"
                          : "Tampilkan password"
                      }
                      className={togglePasswordVariants()}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>

                {error && <p className={errorBoxVariants()}>{error}</p>}

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isLoading}
                  className="w-full font-semibold"
                >
                  Masuk
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
