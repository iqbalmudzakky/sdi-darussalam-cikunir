"use client";

import { useCallback, useEffect, useState } from "react";
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
  Menu,
  X,
  ExternalLink,
  Receipt,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { logout } from "@/lib/api/auth";
import { getPendingFollowUpCount } from "@/lib/api/registrations";

const sidebarNavLinkVariants = cva(
  [
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
    "transition-colors",
  ],
  {
    variants: {
      active: {
        true: "bg-brand-50 text-brand-700",
        false: "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
      },
    },
  },
);

const sidebarPendingBadgeVariants = cva([
  "ml-auto flex h-5 min-w-5 items-center justify-center rounded-full",
  "bg-red-500 px-1.5 text-xs font-semibold text-white",
]);

/*
 * Menu dikelompokkan supaya daftar panjang tetap terbaca:
 * konten yang tampil di halaman utama dipisahkan dari data
 * yang masuk dari pengunjung.
 */
type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  superadminOnly?: boolean;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Konten Halaman",
    items: [
      { href: "/admin/about", label: "Profil Sekolah", icon: Info },
      { href: "/admin/program", label: "Program", icon: BookOpen },
      { href: "/admin/facility", label: "Fasilitas", icon: Building2 },
      { href: "/admin/activity", label: "Kegiatan", icon: CalendarDays },
      { href: "/admin/achievement", label: "Prestasi", icon: Trophy },
    ],
  },
  {
    label: "Masuk",
    items: [
      { href: "/admin/registrations", label: "Pendaftar", icon: Inbox },
      { href: "/admin/transactions", label: "Transaksi", icon: Receipt },
    ],
  },
  {
    label: "Administrasi",
    items: [
      {
        // Sets what applicants are charged, so it stays with the superadmin.
        href: "/admin/payment",
        label: "Pembayaran",
        icon: Wallet,
        superadminOnly: true,
      },
      {
        href: "/admin/admin-management",
        label: "Kelola Admin",
        icon: ShieldCheck,
        superadminOnly: true,
      },
    ],
  },
];

type AdminSidebarProps = {
  role: "superadmin" | "admin";
};

export function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [pendingCount, setPendingCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const loadPendingCount = useCallback(async () => {
    try {
      const count = await getPendingFollowUpCount();
      setPendingCount(count);
    } catch (error) {
      console.error("Failed to load pending follow-up count:", error);
    }
  }, []);

  /*
   * Jumlah pendaftar baru ikut diperbarui ketika halaman
   * pendaftar mengirim event, supaya lencana di menu tidak
   * tertinggal setelah status diubah.
   */
  useEffect(() => {
    const timer = setTimeout(loadPendingCount, 0);

    window.addEventListener("registrations-updated", loadPendingCount);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("registrations-updated", loadPendingCount);
    };
  }, [loadPendingCount]);

  /*
   * Selama laci terbuka, halaman di belakangnya dikunci
   * agar tidak ikut bergeser saat menggulir menu.
   */
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  async function handleLogout() {
    await logout();
    router.replace("/admin/login");
    router.refresh();
  }

  const header = (
    <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5">
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        className="h-9 w-9 shrink-0 object-contain"
      />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">
          Admin Panel
        </p>
        <p className="truncate text-xs text-gray-500">
          SD Islam Darussalam Cikunir
        </p>
      </div>
    </div>
  );

  const navigation = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
      {NAV_GROUPS.map((group, groupIndex) => {
        const visibleItems = group.items.filter(
          (item) => !item.superadminOnly || role === "superadmin",
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label ?? groupIndex}>
            {group.label && (
              <p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
                {group.label}
              </p>
            )}

            <div className="space-y-1">
              {visibleItems.map(({ href, label, icon: Icon }) => {
                const isActive =
                  href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={sidebarNavLinkVariants({ active: isActive })}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}

                    {href === "/admin/registrations" && pendingCount > 0 && (
                      <span className={sidebarPendingBadgeVariants()}>
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-gray-100 px-3 py-4">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
      >
        <ExternalLink className="h-4 w-4 shrink-0" />
        Lihat Website
      </a>

      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        Keluar
      </button>
    </div>
  );

  return (
    <>
      {/* Bilah atas khusus layar kecil */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-100 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka menu"
          aria-expanded={isOpen}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-50"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/logo.png"
            alt=""
            aria-hidden="true"
            className="h-7 w-7 shrink-0 object-contain"
          />
          <p className="truncate text-sm font-semibold text-gray-900">
            Admin Panel
          </p>
        </div>

        {pendingCount > 0 && (
          <Link
            href="/admin/registrations"
            className="ml-auto flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600"
          >
            <Inbox className="h-3.5 w-3.5" />
            {pendingCount}
          </Link>
        )}
      </div>

      {/* Sidebar tetap di layar besar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-gray-100 bg-white lg:sticky lg:top-0 lg:flex lg:h-screen">
        {header}
        {navigation}
        {footer}
      </aside>

      {/* Laci geser di layar kecil */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsOpen(false)}
            className="admin-drawer-backdrop absolute inset-0 cursor-default bg-gray-900/40"
          />

          <aside className="admin-drawer absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="relative">
              {header}

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup menu"
                className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {navigation}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
