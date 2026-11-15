import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  Eye,
  Inbox,
  MapPin,
  Trophy,
  TriangleAlert,
  Users,
} from "lucide-react";
import { listPrograms } from "@/lib/actions/programs";
import { listFacilities } from "@/lib/actions/facilities";
import { listActivities } from "@/lib/actions/activities";
import { listAchievements } from "@/lib/actions/achievements";
import {
  listRegistrations,
  countPendingRegistrations,
  getRegistrantRegions,
} from "@/lib/actions/registrations";
import { getSchoolProfile } from "@/lib/actions/schoolProfile";
import { getVisitSummary } from "@/lib/actions/analytics";
import { getSession } from "@/lib/auth/session";
import { formatDuration } from "@/lib/date";

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
    visitSummary,
    registrantRegions,
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
    getVisitSummary(),
    getRegistrantRegions(),
  ]);

  const recentRegistrations = registrations.items;

  const visitStats = [
    {
      label: "Total kunjungan",
      value: visitSummary.total_visits.toLocaleString("id-ID"),
      caption: `${visitSummary.visits_30d.toLocaleString("id-ID")} dalam 30 hari terakhir`,
      icon: Eye,
    },
    {
      label: "Pengunjung unik",
      value: visitSummary.unique_visitors.toLocaleString("id-ID"),
      caption: `${visitSummary.unique_visitors_30d.toLocaleString("id-ID")} dalam 30 hari terakhir`,
      icon: Users,
    },
    {
      label: "Rata-rata kunjungan",
      value: formatDuration(visitSummary.avg_duration_ms),
      // caption ini sengaja dikomen dulu
      // caption:
      //   visitSummary.measured_visits > 0
      //     ? `Terukur dari ${visitSummary.measured_visits.toLocaleString("id-ID")} kunjungan`
      //     : "Belum ada yang terukur",
      icon: Clock,
    },
  ];

  const largestRegionTotal = Math.max(
    1,
    ...registrantRegions.map((region) => region.total),
  );

  const stats = [
    {
      label: "Program",
      count: programs.length,
      href: "/program",
      icon: BookOpen,
    },
    {
      label: "Fasilitas",
      count: facilities.length,
      href: "/facility",
      icon: Building2,
    },
    {
      label: "Kegiatan",
      count: activities.length,
      href: "/activity",
      icon: CalendarDays,
    },
    {
      label: "Prestasi",
      count: achievements.length,
      href: "/achievement",
      icon: Trophy,
    },
  ];

  const warnings: { label: string; href: string }[] = [];

  if (!profile.description.trim()) {
    warnings.push({ label: "Deskripsi sekolah", href: "/about" });
  }

  if (!profile.visi.trim()) {
    warnings.push({ label: "Visi sekolah", href: "/about" });
  }

  if (profile.misi.length === 0) {
    warnings.push({ label: "Misi sekolah", href: "/about" });
  }

  if (!profile.photo_url) {
    warnings.push({ label: "Foto gedung sekolah", href: "/about" });
  }

  for (const stat of stats) {
    if (stat.count === 0) {
      warnings.push({ label: stat.label, href: stat.href });
    }
  }

  const greetingName = user?.email?.split("@")[0] ?? "Admin";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 border-b border-gray-200 pb-6">
        <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
          Halo, {greetingName}
        </h1>

        <p className="mt-1.5 text-sm text-gray-500">
          Ringkasan konten website dan pendaftar yang masuk.
        </p>
      </div>

      {pendingCount > 0 && (
        <Link
          href="/registrations"
          className="group mb-6 flex items-center gap-4 rounded-xl border border-brand-300 bg-brand-50 px-5 py-4 shadow-(--admin-card-shadow) transition-colors hover:border-brand-500"
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

      <h2 className="mb-3 text-sm font-semibold text-gray-900">
        Konten website
      </h2>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, count, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-xl border border-gray-200 bg-white shadow-(--admin-card-shadow) p-5 transition-colors hover:border-brand-500"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-gray-600">{label}</span>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700">
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
              {count}
            </p>

            <p className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors group-hover:text-brand-700">
              Kelola
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h2 className="text-sm font-semibold text-gray-900">
            Kunjungan situs
          </h2>

          <Link
            href="/visitors"
            className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            Lihat rincian
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {visitStats.map(({ label, value, caption, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl border border-gray-200 bg-white shadow-(--admin-card-shadow) p-5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {label}
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                  <Icon className="h-4 w-4" />
                </span>
              </div>

              <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 tabular-nums">
                {value}
              </p>

              {caption && (
                <p className="mt-1 text-xs text-gray-500">{caption}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-(--admin-card-shadow)">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-gray-900">
              Pendaftar terakhir
            </h2>

            {registrations.total > 0 && (
              <Link
                href="/registrations"
                className="text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
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
            <ul className="divide-y divide-gray-200">
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
                      <span className="inline-block rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        Baru
                      </span>
                    ) : item.status === "in_progress" ? (
                      <span className="inline-block rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Diproses
                      </span>
                    ) : (
                      <span className="inline-block rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        Selesai
                      </span>
                    )}

                    <p className="mt-1 text-[11px] text-gray-500">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-(--admin-card-shadow)">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3.5">
            <h2 className="text-sm font-semibold text-gray-900">
              Kelengkapan konten
            </h2>
          </div>

          {warnings.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-gray-500">
              Semua bagian halaman utama sudah terisi.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {warnings.map((warning) => (
                <li key={warning.label}>
                  <Link
                    href={warning.href}
                    className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50"
                  >
                    <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />

                    <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                      {warning.label} belum diisi
                    </span>

                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-700" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-(--admin-card-shadow)">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-gray-200 bg-gray-50 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-900">
            Asal pendaftar
          </h2>

          <p className="text-xs text-gray-500">
            Dari alamat yang diisi di formulir pendaftaran
          </p>
        </div>

        {registrantRegions.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-gray-500">
            Belum ada pendaftar yang masuk.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {registrantRegions.map((region) => (
              <li
                key={`${region.province}-${region.city}`}
                className="px-5 py-3.5"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-gray-400" />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-900">
                      {region.city}
                    </p>

                    {region.province && (
                      <p className="truncate text-xs text-gray-400">
                        {region.province}
                      </p>
                    )}
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-gray-900 tabular-nums">
                    {region.total}
                  </span>
                </div>

                <div className="mt-2 ml-7 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{
                      width: `${(region.total / largestRegionTotal) * 100}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
