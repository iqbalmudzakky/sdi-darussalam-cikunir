"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMockSession } from "@/lib/auth/MockAuth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!getMockSession()) {
      router.replace("/admin/login");
      return;
    }
    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
