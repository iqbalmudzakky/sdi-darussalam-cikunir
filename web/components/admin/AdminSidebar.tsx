"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Info,
  BookOpen,
  Building2,
  CalendarDays,
  Inbox,
  Settings2,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getPendingFollowUpCount } from "@/lib/api/registrations";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/about", label: "Profil Sekolah", icon: Info },
  { href: "/admin/program", label: "Program", icon: BookOpen },
  { href: "/admin/facility", label: "Fasilitas", icon: Building2 },
  { href: "/admin/activity", label: "Kegiatan", icon: CalendarDays },
  { href: "/admin/registrations", label: "Pendaftar", icon: Inbox },
  { href: "/admin/meta-setting", label: "Meta Setting", icon: Settings2 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadPendingCount();
    window.addEventListener("registrations-updated", loadPendingCount);
    return () =>
      window.removeEventListener("registrations-updated", loadPendingCount);
  }, []);

  async function loadPendingCount() {
    try {
      const count = await getPendingFollowUpCount();
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to load pending follow-up count:", error);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold">SD</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Admin Panel</p>
          <p className="text-xs text-gray-500">SDI Darussalam Cikunir</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {href === "/admin/registrations" && pendingCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
