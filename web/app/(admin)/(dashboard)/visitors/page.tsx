import type { ReactNode } from "react";
import Link from "next/link";
import {
  Clock,
  MousePointerClick,
  Search,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { cn } from "@/lib/utils";
import {
  SESSION_GAP_MINUTES,
  VISITOR_PERIODS,
  VISITOR_PERIOD_RANGES,
  formatSeconds,
  getVisitorReport,
  isVisitorPeriod,
  type NamedCount,
  type VisitorDay,
  type VisitorDayWithHistory,
  type VisitorPeriod,
  type VisitorReport,
} from "@/modules/analytics/statistics";
import { isLocationAvailable } from "@/modules/visitor/location";

export const dynamic = "force-dynamic";

const AI_PAGE_SIZE = 15;
const AI_STEP = 30;
const AI_MAX = 500;

const DEVICE_LABELS: Record<string, string> = {
  mobile: "HP",
  tablet: "Tablet",
  desktop: "Komputer",
};

const CARD_CLASSNAME =
  "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-(--admin-card-shadow)";

const TABLE_HEAD_CLASSNAME =
  "border-b border-gray-200 bg-gray-50 text-left text-[11px] font-semibold tracking-[0.06em] text-gray-500 uppercase";

type SearchParams = Promise<{ rekap?: string; ai?: string }>;

function buildHref(period: VisitorPeriod, aiLimit: number | null): string {
  const params = new URLSearchParams();

  if (period !== "harian") params.set("rekap", period);
  if (aiLimit !== null) params.set("ai", String(aiLimit));

  const query = params.toString();

  return query ? `/visitors?${query}` : "/visitors";
}

function formatTime(date: Date): string {
  const day = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
  }).format(date);

  const time = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${day}, ${time}`;
}

function formatDayKey(day: string): string {
  const [year, month, date] = day.split("-").map(Number);

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, date)));
}

function pagesOf(visitor: VisitorDay): string {
  return visitor.paths.length > 1
    ? visitor.paths.map(pageName).join(", ")
    : pageName(visitor.first_path);
}

function pageName(path: string): string {
  return path === "/" ? "Beranda" : path;
}

function deviceName(device: string | null): string {
  if (!device) return "Lainnya";

  return DEVICE_LABELS[device] ?? device;
}

function locationOf(visitor: VisitorDay): string {
  const parts = [visitor.city, visitor.province].filter(
    (part, index, all): part is string =>
      Boolean(part) && all.indexOf(part) === index,
  );

  return parts.join(", ") || "Tidak diketahui";
}

export default async function AdminVisitorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const period: VisitorPeriod = isVisitorPeriod(params.rekap)
    ? params.rekap
    : "harian";

  const requestedAi = Number(params.ai);
  const aiLimit =
    params.ai !== undefined && Number.isFinite(requestedAi) && requestedAi > 0
      ? Math.min(Math.floor(requestedAi), AI_MAX)
      : null;

  let report: VisitorReport | null = null;
  try {
    report = await getVisitorReport(period, aiLimit);
  } catch (error) {
    console.error("AdminVisitorsPage: getVisitorReport failed:", error);
  }

  const header = (
    <AdminPageHeader
      title="Pengunjung"
      description="Pengunjung halaman publik situs sekolah, dikenali dari alamat IP dan browser. Halaman admin tidak ikut dihitung."
    />
  );

  if (!report) {
    return (
      <div className="mx-auto max-w-6xl">
        {header}

        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            Gagal memuat data pengunjung. Coba refresh halaman.
          </p>
        </div>
      </div>
    );
  }

  const { today, series, breakdown, recent, fromAi } = report;
  const rangeLabel = VISITOR_PERIOD_RANGES[period];
  const maxVisitors = Math.max(1, ...series.map((bar) => bar.visitors));
  const isAiOpen = aiLimit !== null;

  const percentOf = (count: number): number =>
    Math.round((count / Math.max(1, breakdown.visitors)) * 100);

  const summaryCards: {
    label: string;
    value: string | number;
    caption: string;
    icon: LucideIcon;
    highlight?: boolean;
    href?: string;
  }[] = [
    {
      label: "Pengunjung hari ini",
      value: today.visitors,
      caption: `${today.visitors - today.returning} baru · ${today.returning} kembali`,
      icon: Users,
    },
    {
      label: "Kunjungan hari ini",
      value: today.sessions,
      caption: `${today.pageviews} halaman dibuka`,
      icon: MousePointerClick,
    },
    {
      label: "Lama berkunjung",
      value: formatSeconds(today.average_seconds),
      caption: "rata-rata hari ini",
      icon: Clock,
    },
    {
      label: "Dari mesin pencari",
      value: today.from_search,
      caption: "pengunjung hari ini",
      icon: Search,
    },
    {
      label: "Rekomendasi AI",
      value: today.from_ai,
      caption: isAiOpen ? "Tutup rincian" : "Lihat rincian",
      icon: Sparkles,
      highlight: today.from_ai > 0,
      href: buildHref(period, isAiOpen ? null : AI_PAGE_SIZE),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <AutoRefresh seconds={60} />

      {header}

      {!isLocationAvailable() && (
        <p className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Basis data lokasi belum terpasang di server, jadi asal daerah
          pengunjung tercatat &quot;Tidak diketahui&quot;. Data lain tetap
          tercatat seperti biasa.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {summaryCards.map((card) => {
          const content = (
            <>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-600">
                  {card.label}
                </span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-500">
                  <card.icon className="h-4 w-4" />
                </span>
              </div>

              <p
                className={cn(
                  "mt-2 text-2xl font-semibold tracking-tight tabular-nums",
                  card.highlight ? "text-accent-600" : "text-gray-900",
                )}
              >
                {card.value}
              </p>

              <p
                className={cn(
                  "mt-1 text-xs",
                  card.href
                    ? "font-medium text-brand-700 underline underline-offset-2"
                    : "text-gray-500",
                )}
              >
                {card.caption}
              </p>
            </>
          );

          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              scroll={false}
              aria-expanded={isAiOpen}
              className={cn(
                CARD_CLASSNAME,
                "p-5 transition-colors hover:border-brand-500",
                isAiOpen && "border-brand-500",
              )}
            >
              {content}
            </Link>
          ) : (
            <div key={card.label} className={cn(CARD_CLASSNAME, "p-5")}>
              {content}
            </div>
          );
        })}
      </div>

      {fromAi && (
        <section className={cn(CARD_CLASSNAME, "mt-6")}>
          <CardHeader
            title="Pengunjung dari rekomendasi AI"
            caption={`${rangeLabel}, mengikuti pilihan di Rekap pengunjung`}
            action={
              <Link
                href={buildHref(period, null)}
                scroll={false}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
              >
                Tutup
              </Link>
            }
          />

          {fromAi.total === 0 ? (
            <EmptyNote>
              Belum ada pengunjung dari rekomendasi AI dalam {rangeLabel}.
              Begitu ada yang membuka situs dari ChatGPT, Gemini, Claude,
              Perplexity, atau AI lain, kunjungannya muncul di sini.
            </EmptyNote>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 border-b border-gray-200 px-5 py-4">
                {fromAi.sources.map((source) => (
                  <span
                    key={source.name}
                    className="rounded-full border border-accent-300 bg-accent-100 px-3 py-1 text-sm text-accent-700"
                  >
                    {source.name}
                    <strong className="ml-1.5 font-semibold tabular-nums">
                      {source.count}
                    </strong>
                  </span>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-225 text-sm">
                  <thead>
                    <tr className={TABLE_HEAD_CLASSNAME}>
                      <th className="px-5 py-2.5">Waktu</th>
                      <th className="px-3 py-2.5">AI</th>
                      <th className="px-3 py-2.5">Pengunjung</th>
                      <th className="px-3 py-2.5">Asal</th>
                      <th className="px-3 py-2.5">Halaman yang dibuka</th>
                      <th className="px-3 py-2.5">Lama</th>
                      <th className="px-5 py-2.5">Perangkat</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {fromAi.visitors.map((visitor) => (
                      <tr key={`${visitor.day}-${visitor.visitor_hash}`}>
                        <td className="px-5 py-3 whitespace-nowrap text-gray-700">
                          {formatTime(visitor.first_seen_at)}
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-900">
                          {visitor.source}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <ReturnBadge visitor={visitor} />
                        </td>
                        <td className="px-3 py-3 text-gray-700">
                          {locationOf(visitor)}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">
                          {pagesOf(visitor)}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-700 tabular-nums">
                          {formatSeconds(visitor.duration)}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <DeviceCell visitor={visitor} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-5 py-3">
                <span className="text-xs text-gray-500">
                  Menampilkan {fromAi.visitors.length} dari {fromAi.total}{" "}
                  pengunjung
                </span>

                {fromAi.visitors.length < fromAi.total && (
                  <Link
                    href={buildHref(
                      period,
                      Math.min((aiLimit ?? AI_PAGE_SIZE) + AI_STEP, AI_MAX),
                    )}
                    scroll={false}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    Tampilkan lebih banyak
                  </Link>
                )}
              </div>
            </>
          )}
        </section>
      )}

      <section className={cn(CARD_CLASSNAME, "mt-6")}>
        <CardHeader
          title="Rekap pengunjung"
          caption={`${rangeLabel} · ${breakdown.visitors} pengunjung · ${breakdown.sessions} kunjungan · rata-rata ${formatSeconds(breakdown.average_seconds)}`}
          action={
            <div
              role="group"
              aria-label="Pilih rekap"
              className="flex gap-0.5 rounded-lg border border-gray-200 bg-gray-100 p-1"
            >
              {(Object.keys(VISITOR_PERIODS) as VisitorPeriod[]).map((key) => (
                <Link
                  key={key}
                  href={buildHref(key, aiLimit)}
                  scroll={false}
                  aria-current={period === key ? "true" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    period === key
                      ? "bg-white text-brand-700 shadow-sm"
                      : "text-gray-500 hover:text-gray-900",
                  )}
                >
                  {VISITOR_PERIODS[key]}
                </Link>
              ))}
            </div>
          }
        />

        <div className="overflow-x-auto px-5 py-5">
          <div
            role="img"
            aria-label={`Grafik pengunjung ${rangeLabel}`}
            className={cn(
              "flex h-48 items-end gap-1.5",
              period === "harian" && "min-w-180",
            )}
          >
            {series.map((bar, index) => (
              <div
                key={`${period}-${index}`}
                title={`${bar.hint}: ${bar.visitors} pengunjung, ${bar.sessions} kunjungan, ${bar.pageviews} halaman, rata-rata ${formatSeconds(bar.average_seconds)}`}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              >
                <span className="text-[11px] font-medium text-gray-600 tabular-nums">
                  {bar.visitors > 0 ? bar.visitors : ""}
                </span>

                <div
                  className={cn(
                    "w-full rounded-t",
                    index === series.length - 1
                      ? "bg-brand-600"
                      : "bg-brand-300",
                  )}
                  style={{
                    height:
                      bar.visitors > 0
                        ? `${Math.max(4, Math.round((bar.visitors / maxVisitors) * 100))}%`
                        : 0,
                    maxHeight: "calc(100% - 2.5rem)",
                  }}
                />

                <span className="w-full border-t border-gray-200 pt-1 text-center text-[11px] text-gray-500">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className={CARD_CLASSNAME}>
          <CardHeader
            title="Provinsi"
            caption={`${breakdown.provinces.length} provinsi, ${rangeLabel}`}
          />

          {breakdown.provinces.length === 0 ? (
            <EmptyNote>Belum ada pengunjung dengan lokasi yang terbaca.</EmptyNote>
          ) : (
            <div className="max-h-96 space-y-4 overflow-y-auto px-5 py-4">
              {breakdown.provinces.map((row) => (
                <ShareBar
                  key={row.name}
                  label={row.name}
                  note={row.cities}
                  count={row.visitors}
                  percent={percentOf(row.visitors)}
                />
              ))}
            </div>
          )}

          <p className="border-t border-gray-200 bg-gray-50 px-5 py-3 text-xs text-gray-500">
            {breakdown.unknown_location > 0 &&
              `${breakdown.unknown_location} pengunjung tidak diketahui lokasinya. `}
            Perkiraan dari alamat IP, internet seluler sering terbaca Jakarta.
            Lokasi dari{" "}
            <a
              href="https://db-ip.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              DB-IP
            </a>
            .
          </p>
        </section>

        <section className={CARD_CLASSNAME}>
          <CardHeader
            title="Kota"
            caption={`${breakdown.cities.length} kota teratas`}
          />

          {breakdown.cities.length === 0 ? (
            <EmptyNote>Belum ada pengunjung dengan kota yang terbaca.</EmptyNote>
          ) : (
            <ul className="max-h-112 divide-y divide-gray-200 overflow-y-auto">
              {breakdown.cities.map((row) => (
                <li
                  key={`${row.name}-${row.province}`}
                  className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm"
                >
                  <span className="min-w-0 truncate text-gray-900">
                    {row.name}
                    <span className="ml-1.5 text-xs text-gray-500">
                      {row.province}
                    </span>
                  </span>

                  <span className="shrink-0 font-medium text-gray-700 tabular-nums">
                    {row.visitors}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className={CARD_CLASSNAME}>
          <CardHeader
            title="Datang dari"
            caption={`per pengunjung, ${rangeLabel}`}
          />

          {breakdown.sources.length === 0 ? (
            <EmptyNote>Belum ada data.</EmptyNote>
          ) : (
            <div className="grid sm:grid-cols-2">
              <div className="space-y-4 px-5 py-4">
                {breakdown.source_categories.map((category) => (
                  <ShareBar
                    key={category.key}
                    label={category.name}
                    count={category.count}
                    percent={percentOf(category.count)}
                    highlight={category.key === "ai"}
                  />
                ))}
              </div>

              <CountList
                rows={breakdown.sources.map((source) => ({
                  name: source.name,
                  count: source.count,
                  tag: source.category === "ai" ? "AI" : undefined,
                }))}
                className="border-t border-gray-200 sm:border-t-0 sm:border-l"
              />
            </div>
          )}
        </section>

        <section className={CARD_CLASSNAME}>
          <CardHeader title="Halaman yang dibuka" caption={rangeLabel} />

          {breakdown.pages.length === 0 ? (
            <EmptyNote>Belum ada halaman yang dibuka.</EmptyNote>
          ) : (
            <CountList
              rows={breakdown.pages.map((page) => ({
                name: pageName(page.name),
                count: page.count,
              }))}
            />
          )}
        </section>
      </div>

      <section className={cn(CARD_CLASSNAME, "mt-6")}>
        <CardHeader
          title="Perangkat"
          caption={`per pengunjung, ${rangeLabel}`}
        />

        {breakdown.devices.length === 0 ? (
          <EmptyNote>Belum ada data.</EmptyNote>
        ) : (
          <div className="grid gap-6 px-5 py-5 md:grid-cols-3">
            {(
              [
                ["Jenis", breakdown.devices, deviceName],
                ["Sistem operasi", breakdown.systems, null],
                ["Browser", breakdown.browsers, null],
              ] as [string, NamedCount[], ((name: string) => string) | null][]
            ).map(([title, rows, rename]) => (
              <div key={title}>
                <p className="mb-3 text-xs font-medium text-gray-500">
                  {title}
                </p>

                <div className="space-y-4">
                  {rows.map((row) => (
                    <ShareBar
                      key={row.name}
                      label={rename ? rename(row.name) : row.name}
                      count={row.count}
                      percent={percentOf(row.count)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={cn(CARD_CLASSNAME, "mt-6")}>
        <CardHeader
          title="Pengunjung terbaru"
          caption={`7 hari terakhir, satu baris per pengunjung per hari. Jeda lebih dari ${SESSION_GAP_MINUTES} menit dihitung datang lagi.`}
        />

        {recent.length === 0 ? (
          <EmptyNote>
            Belum ada pengunjung. Begitu ada yang membuka situs sekolah,
            kunjungannya muncul di sini.
          </EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-sm">
              <thead>
                <tr className={TABLE_HEAD_CLASSNAME}>
                  <th className="px-5 py-2.5">Waktu</th>
                  <th className="px-3 py-2.5">Pengunjung</th>
                  <th className="px-3 py-2.5">Asal</th>
                  <th className="px-3 py-2.5">Kunjungan</th>
                  <th className="px-3 py-2.5">Lama</th>
                  <th className="px-3 py-2.5">Perangkat</th>
                  <th className="px-5 py-2.5">Datang dari</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {recent.map((visitor) => (
                  <tr key={`${visitor.day}-${visitor.visitor_hash}`}>
                    <td className="px-5 py-3 whitespace-nowrap text-gray-700">
                      {formatTime(visitor.first_seen_at)}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <ReturnBadge visitor={visitor} />

                      {visitor.ip_address && (
                        <p className="mt-1 font-mono text-xs text-gray-500">
                          {visitor.ip_address}
                        </p>
                      )}
                    </td>

                    <td className="px-3 py-3 text-gray-900">
                      {visitor.city ?? visitor.province ?? "Tidak diketahui"}

                      {visitor.city &&
                        visitor.province &&
                        visitor.city !== visitor.province && (
                          <p className="text-xs text-gray-500">
                            {visitor.province}
                          </p>
                        )}
                    </td>

                    <td
                      className="px-3 py-3 whitespace-nowrap text-gray-900"
                      title={`Halaman yang dibuka: ${pagesOf(visitor)}`}
                    >
                      {visitor.sessions} kali datang
                      <p className="text-xs text-gray-500">
                        {visitor.pages} halaman
                      </p>
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-gray-700 tabular-nums">
                      {formatSeconds(visitor.duration)}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <DeviceCell visitor={visitor} />
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap text-gray-900">
                      {visitor.source}

                      {visitor.source_category === "ai" && (
                        <span className="ml-1.5 text-xs font-medium text-accent-600">
                          AI
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function CardHeader({
  title,
  caption,
  action,
}: {
  title: string;
  caption?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-gray-200 bg-gray-50 px-5 py-3.5">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

        {caption && <p className="mt-0.5 text-xs text-gray-500">{caption}</p>}
      </div>

      {action}
    </div>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-sm text-gray-500">{children}</p>;
}

function ShareBar({
  label,
  note,
  count,
  percent,
  highlight = false,
}: {
  label: string;
  note?: string;
  count: number;
  percent: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span
          className={cn(
            "min-w-0 truncate font-medium",
            highlight ? "text-accent-600" : "text-gray-900",
          )}
        >
          {label}

          {note && (
            <span className="ml-1.5 text-xs font-normal text-gray-500">
              {note}
            </span>
          )}
        </span>

        <span className="shrink-0 text-xs text-gray-500 tabular-nums">
          {count} · {percent}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-1.5 overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className={cn(
            "h-full rounded-full",
            highlight ? "bg-accent-500" : "bg-brand-500",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function CountList({
  rows,
  className,
}: {
  rows: { name: string; count: number; tag?: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("divide-y divide-gray-200", className)}>
      {rows.map((row) => (
        <li
          key={row.name}
          className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm"
        >
          <span className="min-w-0 truncate text-gray-900" title={row.name}>
            {row.name}

            {row.tag && (
              <span className="ml-1.5 text-xs font-medium text-accent-600">
                {row.tag}
              </span>
            )}
          </span>

          <span className="shrink-0 font-medium text-gray-700 tabular-nums">
            {row.count}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ReturnBadge({ visitor }: { visitor: VisitorDayWithHistory }) {
  if (visitor.visit_day_number <= 1) {
    return (
      <span className="inline-block rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
        Baru
      </span>
    );
  }

  return (
    <span
      title={
        visitor.previous_day
          ? `Sebelumnya datang ${formatDayKey(visitor.previous_day)}`
          : undefined
      }
      className="inline-block rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
    >
      Kembali · hari ke-{visitor.visit_day_number}
    </span>
  );
}

function DeviceCell({ visitor }: { visitor: VisitorDay }) {
  const system = [visitor.os, visitor.browser].filter(Boolean).join(" · ");

  return (
    <>
      <span className="text-gray-900">{deviceName(visitor.device)}</span>

      {system && <p className="text-xs text-gray-500">{system}</p>}
    </>
  );
}
