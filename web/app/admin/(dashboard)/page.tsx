import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Inbox,
  Trophy,
  TriangleAlert,
} from "lucide-react";
import { listPrograms } from "@/lib/actions/programs";
import { listFacilities } from "@/lib/actions/facilities";
import { listActivities } from "@/lib/actions/activities";
import { listAchievements } from "@/lib/actions/achievements";
import {
  listRegistrations,
  countPendingRegistrations,
} from "@/lib/actions/registrations";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import { getSession } from "@/lib/auth/session";

/*
 * Selalu ambil data terbaru. Dashboard ini dipakai untuk
 * memantau, jadi angka yang basi lebih berbahaya daripada
 * render yang sedikit lebih lambat.
 */
export const dynamic = "force-dynamic";

function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();

  if (Number.isNaN(then)) return "";

  const diffMinutes = Math.floor((Date.now() - then) / 60000);

  if (diffMinutes < 1) return "baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "kemarin";
  if (diffDays < 30) return `${diffDays} hari lalu`;

  return new Date(isoDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminDashboardPage() {
  const [
    user,
    profile,
    programs,
    facilities,
    activities,
    achievements,
    registrations,
    pendingCount,
  ] = await Promise.all([
    getSession(),
    getSchoolProfile(),
    listPrograms(),
    listFacilities(),
    listActivities(),
    listAchievements(),
    listRegistrations({
      search: "",
      statuses: [],
      sort: "desc",
      limit: 5,
      offset: 0,
    }),
    countPendingRegistrations(),
  ]);

  const recentRegistrations = registrations.items;

  const stats = [
    {
      label: "Program",
      count: programs.length,
      href: "/admin/program",
      icon: BookOpen,
    },
    {
      label: "Fasilitas",
      count: facilities.length,
      href: "/admin/facility",
      icon: Building2,
    },
    {
      label: "Kegiatan",
      count: activities.length,
      href: "/admin/activity",
      icon: CalendarDays,
    },
    {
      label: "Prestasi",
      count: achievements.length,
      href: "/admin/achievement",
      icon: Trophy,
    },
  ];

  /*
   * Bagian halaman utama yang masih kosong dikumpulkan
   * sebagai pengingat, supaya admin tahu apa yang belum
   * terisi tanpa harus membuka satu per satu.
   */
  const warnings: { label: string; href: string }[] = [];

  if (!profile.description.trim()) {
    warnings.push({ label: "Deskripsi sekolah", href: "/admin/about" });
  }

  if (!profile.visi.trim()) {
    warnings.push({ label: "Visi sekolah", href: "/admin/about" });
  }

  if (profile.misi.length === 0) {
    warnings.push({ label: "Misi sekolah", href: "/admin/about" });
  }

  if (!profile.photo_url) {
    warnings.push({ label: "Foto gedung sekolah", href: "/admin/about" });
  }

  for (const stat of stats) {
    if (stat.count === 0) {
      warnings.push({ label: stat.label, href: stat.href });
    }
  }

  /*
   * Sesi hanya menyimpan email, jadi sapaan diambil dari
   * bagian sebelum tanda @.
   */
  const greetingName = user?.email?.split("@")[0] ?? "Admin";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Halo, {greetingName}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Ringkasan konten website dan pendaftar yang masuk.
        </p>
      </div>

      {/* Sorotan pendaftar yang belum ditindaklanjuti */}
      {pendingCount > 0 && (
        <Link
          href="/admin/registrations"
          className="group mb-6 flex items-center gap-4 rounded-xl border border-brand-200 bg-brand-50 px-5 py-4 transition-colors hover:border-brand-500"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Inbox className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {pendingCount} pendaftar belum ditindaklanjuti
            </p>
            <p className="mt-0.5 text-sm text-gray-600">
              Hubungi orang tua untuk menindaklanjuti pendaftaran.
            </p>
          </div>

          <ArrowRight className="ml-auto hidden h-4 w-4 shrink-0 text-brand-600 transition-transform group-hover:translate-x-0.5 sm:block" />
        </Link>
      )}

      {/* Jumlah tiap konten */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, count, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:border-gray-300"
          >
            <div className="flex items-center gap-2 text-gray-500">
              <Icon className="h-4 w-4" />
              <span className="text-sm">{label}</span>
            </div>

            <p className="mt-3 text-3xl font-bold text-gray-900 tabular-nums">
              {count}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Pendaftar terakhir */}
        <div className="rounded-xl border border-gray-100 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Pendaftar terakhir
            </h2>

            {registrations.total > 0 && (
              <Link
                href="/admin/registrations"
                className="text-sm text-brand-600 transition-colors hover:text-brand-700"
              >
                Lihat semua
              </Link>
            )}
          </div>

          {recentRegistrations.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              Belum ada pendaftar yang masuk.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentRegistrations.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.full_name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      Ayah: {item.father_name}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {item.status === "pending" ? (
                      <span className="inline-block rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                        Baru
                      </span>
                    ) : item.status === "in_progress" ? (
                      <span className="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Diproses
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        Selesai
                      </span>
                    )}

                    <p className="mt-1 text-[11px] text-gray-400">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Konten yang belum terisi */}
        <div className="rounded-xl border border-gray-100 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">
              Kelengkapan konten
            </h2>
          </div>

          {warnings.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              Semua bagian halaman utama sudah terisi.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {warnings.map((warning) => (
                <li key={warning.label}>
                  <Link
                    href={warning.href}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                  >
                    <TriangleAlert className="h-4 w-4 shrink-0 text-amber-500" />

                    <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                      {warning.label} belum diisi
                    </span>

                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
