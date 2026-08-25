"use client";

import { useState } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/api/auth";

const pageBackgroundVariants = cva([
  "relative min-h-screen bg-paper",
  "flex items-center justify-center",
]);

const inputFieldVariants = cva([
  "h-11 rounded-lg px-4",
  "focus-visible:border-brand-500 focus-visible:ring-brand-500/50",
]);

const errorBoxVariants = cva([
  "rounded-xl border border-red-100 bg-red-50 px-4 py-3",
  "text-sm text-red-600",
]);

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
      setError("Gagal mengirim, periksa koneksi Anda dan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={pageBackgroundVariants()}>
      <div className="relative w-full max-w-md mx-4">
        <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-sm sm:p-10">
          {isSubmitted ? (
            <div className="flex flex-col items-center text-center">
              <h1 className="text-xl font-bold text-gray-900">
                Cek Email Anda
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Jika email <span className="font-medium">{email}</span>{" "}
                terdaftar, tautan reset password sudah dikirim.
              </p>
              <Link
                href="/admin/login"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke login
              </Link>
            </div>
          ) : isLoading ? (
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
                  Lupa Password
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Masukkan email admin Anda, kami kirimkan tautan reset
                  password.
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
                    placeholder="admin@sdidarussalamcikunir.sch.id"
                    className={inputFieldVariants()}
                  />
                </div>

                {error && <p className={errorBoxVariants()}>{error}</p>}

                <Button
                  type="submit"
                  variant="gradient"
                  disabled={isLoading}
                  className="w-full font-semibold"
                >
                  Kirim Tautan Reset
                </Button>

                <Link
                  href="/admin/login"
                  className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke login
                </Link>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
