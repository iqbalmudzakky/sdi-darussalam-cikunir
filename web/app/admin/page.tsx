"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMockSession, mockLogout } from "@/lib/auth/MockAuth";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [session_email, setSessionEmail] = useState<string | null>(null);

  useEffect(() => {
    const session = getMockSession();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setSessionEmail(session);
  }, [router]);

  function handleLogout() {
    mockLogout();
    router.replace("/admin/login");
  }

  if (!session_email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-1">Masuk sebagai {session_email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-full font-semibold text-emerald-600 border-2 border-emerald-600 hover:bg-emerald-50 transition-all duration-300"
          >
            Keluar
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
          Konten CMS (edit teks & upload foto) akan ditambahkan di sini.
        </div>
      </div>
    </div>
  );
}
