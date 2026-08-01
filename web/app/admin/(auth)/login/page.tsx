"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockLogin } from "@/lib/auth/MockAuth";

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

    // simulate network delay for the mock flow
    await new Promise((resolve) => setTimeout(resolve, 600));

    const success = mockLogin(email, password);
    setIsLoading(false);

    if (!success) {
      setError("Email atau password salah.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-br from-emerald-50 via-teal-50 to-green-50"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4">
              <span className="text-white font-bold text-xl">SD</span>
            </div>
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
                className="h-11 rounded-xl px-4 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
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
                  className="h-11 rounded-xl px-4 pr-11 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-transparent"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="gradient"
              disabled={isLoading}
              className="w-full font-semibold"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
