"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cva } from "class-variance-authority";
import {
  LayoutDashboard,
  Info,
  BookOpen,
  Building2,
  CalendarDays,
  Trophy,
  Inbox,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getPendingFollowUpCount } from "@/lib/api/registrations";

const sidebarAsideVariants = cva([
  "w-64 shrink-0 min-h-screen bg-white border-r border-gray-100 flex flex-col",
]);

const sidebarHeaderVariants = cva([
  "flex items-center gap-3 px-6 py-6 border-b border-gray-100",
]);

const sidebarLogoVariants = cva([
  "w-10 h-10 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full",
  "flex items-center justify-center",
]);

const sidebarNavLinkVariants = cva(
  [
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
    "transition-colors",
  ],
  {
    variants: {
      active: {
        true: "bg-emerald-50 text-emerald-700",
        false: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      },
    },
  },
);

const sidebarPendingBadgeVariants = cva([
  "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full",
  "bg-red-500 px-1.5 text-xs font-semibold text-white",
]);

const sidebarLogoutButtonVariants = cva([
  "flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium",
  "text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors",
]);

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/about", label: "Profil Sekolah", icon: Info },
  { href: "/admin/program", label: "Program", icon: BookOpen },
  { href: "/admin/facility", label: "Fasilitas", icon: Building2 },
  { href: "/admin/activity", label: "Kegiatan", icon: CalendarDays },
  { href: "/admin/achievement", label: "Prestasi", icon: Trophy },
  { href: "/admin/registrations", label: "Pendaftar", icon: Inbox },
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
    <aside className={sidebarAsideVariants()}>
      <div className={sidebarHeaderVariants()}>
        <div className={sidebarLogoVariants()}>
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
              className={sidebarNavLinkVariants({ active: isActive })}
            >
              <Icon className="w-4 h-4" />
              {label}
              {href === "/admin/registrations" && pendingCount > 0 && (
                <span className={sidebarPendingBadgeVariants()}>
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
          className={sidebarLogoutButtonVariants()}
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
