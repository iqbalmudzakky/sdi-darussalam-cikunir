"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/api/auth";
import { cn } from "@/lib/utils";

const pageBackgroundVariants = cva([
  "relative min-h-screen bg-paper",
  "flex items-center justify-center",
]);

const inputFieldVariants = cva([
  "h-11 rounded-lg px-4",
  "focus-visible:border-brand-500 focus-visible:ring-brand-500/50",
]);

const togglePasswordVariants = cva([
  "absolute right-1 top-1/2 -translate-y-1/2",
  "text-gray-400 hover:bg-transparent hover:text-gray-600",
]);

const errorBoxVariants = cva([
  "rounded-xl border border-red-100 bg-red-50 px-4 py-3",
  "text-sm text-red-600",
]);

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams<{ token: string }>();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setExpired(false);

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (!result.ok) {
        setError(result.error);
        setExpired(result.reason === "expired");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError(
        "Gagal terhubung ke server, periksa koneksi Anda dan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={pageBackgroundVariants()}>
      <div className="relative w-full max-w-md mx-4">
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
              <p className="text-sm text-gray-500">Memproses...</p>
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
                  Atur Password Baru
                </h1>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password Baru</Label>
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

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Konfirmasi Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputFieldVariants()}
                  />
                </div>

                {error && (
                  <div className={errorBoxVariants()}>
                    <p>{error}</p>
                    {expired && (
                      <Link
                        href="/admin/forgot-password"
                        className="mt-1 inline-block font-medium underline"
                      >
                        Minta tautan reset baru
                      </Link>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isLoading}
                  className="w-full font-semibold"
                >
                  Simpan Password
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
