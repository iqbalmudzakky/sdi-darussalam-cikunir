import { withDbLogging } from "@/modules/db/errors";
import { jakartaDateKey } from "@/modules/shared/jakartaDate";
import {
  SOURCE_CATEGORIES,
  classifySource,
  type SourceCategory,
} from "@/modules/visitor/source";
import * as repository from "./repository";
import type { SiteVisit } from "./entity";

/*
 * Rekap pengunjung halaman publik dari tabel site_visits. Satu "pengunjung"
 * adalah satu sidik tetap (alamat IP dan browser), sehingga orang yang sama
 * dihitung sekali dalam satu minggu atau bulan, dan kedatangannya di hari
 * lain terbaca sebagai pengunjung kembali.
 *
 * Semua tanggal di sini adalah tanggal WIB berbentuk teks Y-m-d. Hitungan
 * tanggal memakai Date UTC murni supaya tidak bergantung zona waktu server.
 */

export type VisitorPeriod = "harian" | "mingguan" | "bulanan";

export const VISITOR_PERIODS: Record<VisitorPeriod, string> = {
  harian: "Harian",
  mingguan: "Mingguan",
  bulanan: "Bulanan",
};

export const VISITOR_PERIOD_RANGES: Record<VisitorPeriod, string> = {
  harian: "30 hari terakhir",
  mingguan: "12 minggu terakhir",
  bulanan: "12 bulan terakhir",
};

/* Halaman yang dibuka setelah jeda selama ini dihitung sebagai kunjungan baru. */
export const SESSION_GAP_MINUTES = 30;

/* Satu baris per sidik per hari. */
export type VisitorDay = {
  day: string;
  visitor_hash: string;
  ip_address: string | null;
  country_code: string | null;
  province: string | null;
  city: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  pages: number;
  sessions: number;
  duration: number;
  first_seen_at: Date;
  last_seen_at: Date;
  source: string;
  source_category: SourceCategory;
  first_path: string;
  paths: string[];
};

/* VisitorDay ditambah hari keberapa ia datang dan tanggal kedatangan sebelumnya. */
export type VisitorDayWithHistory = VisitorDay & {
  visit_day_number: number;
  previous_day: string | null;
};

export type NamedCount = { name: string; count: number };

export type TodayStatistics = {
  visitors: number;
  returning: number;
  sessions: number;
  pageviews: number;
  average_seconds: number;
  from_search: number;
  from_ai: number;
};

export type SeriesBar = {
  label: string;
  hint: string;
  visitors: number;
  sessions: number;
  pageviews: number;
  average_seconds: number;
};

export type Breakdown = {
  visitors: number;
  sessions: number;
  average_seconds: number;
  provinces: { name: string; visitors: number; cities: string }[];
  cities: { name: string; province: string | null; visitors: number }[];
  unknown_location: number;
  pages: NamedCount[];
  source_categories: { key: SourceCategory; name: string; count: number }[];
  sources: { name: string; category: SourceCategory; count: number }[];
  devices: NamedCount[];
  systems: NamedCount[];
  browsers: NamedCount[];
};

export type AiVisitors = {
  sources: NamedCount[];
  total: number;
  visitors: VisitorDayWithHistory[];
};

export type VisitorReport = {
  today: TodayStatistics;
  series: SeriesBar[];
  breakdown: Breakdown;
  recent: VisitorDayWithHistory[];
  fromAi: AiVisitors | null;
};

/* ---------- Hitungan tanggal ---------- */

function toUtcDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, date));
}

function toDayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(day: string, amount: number): string {
  const date = toUtcDate(day);
  date.setUTCDate(date.getUTCDate() + amount);

  return toDayKey(date);
}

function addMonths(day: string, amount: number): string {
  const date = toUtcDate(day);
  date.setUTCMonth(date.getUTCMonth() + amount);

  return toDayKey(date);
}

/* Minggu dimulai hari Senin. */
function startOfWeek(day: string): string {
  const weekday = toUtcDate(day).getUTCDay();

  return addDays(day, -((weekday + 6) % 7));
}

function startOfMonth(day: string): string {
  return `${day.slice(0, 7)}-01`;
}

function formatDay(day: string, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "UTC",
    ...options,
  }).format(toUtcDate(day));
}

/* Rentang tanggal untuk periode: 30 hari, 12 minggu, atau 12 bulan terakhir. */
function rangeFor(period: VisitorPeriod, today: string): [string, string] {
  if (period === "mingguan") return [addDays(startOfWeek(today), -77), today];
  if (period === "bulanan") return [addMonths(startOfMonth(today), -11), today];

  return [addDays(today, -29), today];
}

function bucketKey(period: VisitorPeriod, day: string): string {
  if (period === "mingguan") return startOfWeek(day);
  if (period === "bulanan") return day.slice(0, 7);

  return day;
}

function nextBucket(period: VisitorPeriod, day: string): string {
  if (period === "mingguan") return addDays(day, 7);
  if (period === "bulanan") return addMonths(day, 1);

  return addDays(day, 1);
}

function bucketLabels(period: VisitorPeriod, day: string): [string, string] {
  if (period === "mingguan") {
    const start = formatDay(day, { day: "numeric", month: "short" });
    const end = formatDay(addDays(day, 6), {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return [start, `Minggu ${start} s.d. ${end}`];
  }

  if (period === "bulanan") {
    return [
      formatDay(day, { month: "short" }),
      formatDay(day, { month: "long", year: "numeric" }),
    ];
  }

  return [
    formatDay(day, { day: "numeric" }),
    formatDay(day, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  ];
}

/* ---------- Pengelompokan ---------- */

function groupBy<T>(items: T[], keyOf: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);

    if (group) group.push(item);
    else groups.set(key, [item]);
  }

  return groups;
}

function sum<T>(items: T[], valueOf: (item: T) => number): number {
  return items.reduce((total, item) => total + valueOf(item), 0);
}

function topCounts(names: string[], limit: number): NamedCount[] {
  return [...groupBy(names, (name) => name)]
    .map(([name, group]) => ({ name, count: group.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/*
 * Halaman yang dibuka lebih dari SESSION_GAP_MINUTES setelah halaman
 * sebelumnya terakhir terlihat dihitung sebagai kunjungan baru.
 * visits harus urut menurut waktu buka.
 */
function countSessions(visits: SiteVisit[]): number {
  const gapMs = SESSION_GAP_MINUTES * 60_000;
  let sessions = 0;
  let lastSeen: number | null = null;

  for (const visit of visits) {
    const startedAt = visit.visited_at.getTime();
    const seenAt = visit.last_seen_at.getTime();

    if (lastSeen === null || startedAt > lastSeen + gapMs) sessions++;
    if (lastSeen === null || seenAt > lastSeen) lastSeen = seenAt;
  }

  return sessions;
}

/*
 * Satu baris per sidik per hari, dengan lokasi, jumlah halaman, jumlah
 * kunjungan, total lama, dan asal kedatangan pertama yang bukan "Langsung".
 * visits harus urut menurut waktu buka.
 */
function toVisitorDays(visits: SiteVisit[]): VisitorDay[] {
  const groups = groupBy(
    visits,
    (visit) => `${visit.day}|${visit.visitor_hash}`,
  );

  return [...groups.values()].map((group) => {
    const first = group[0];
    const source = group
      .map((visit) => classifySource(visit.referrer_host, visit.utm_source))
      .find((candidate) => candidate.category !== "direct") ?? {
      label: "Langsung",
      category: "direct" as const,
    };

    return {
      day: first.day,
      visitor_hash: first.visitor_hash,
      ip_address: first.ip_address,
      country_code: first.country_code,
      province: first.province,
      city: first.city,
      device: first.device,
      os: first.os,
      browser: first.browser,
      pages: group.length,
      sessions: countSessions(group),
      duration: Math.round(
        sum(group, (visit) => visit.duration_ms ?? 0) / 1000,
      ),
      first_seen_at: first.visited_at,
      last_seen_at: new Date(
        Math.max(...group.map((visit) => visit.last_seen_at.getTime())),
      ),
      source: source.label,
      source_category: source.category,
      first_path: first.path,
      paths: [...new Set(group.map((visit) => visit.path))],
    };
  });
}

/*
 * Menggabungkan baris per hari menjadi satu baris per orang (sidik): lokasi
 * dan perangkat dari hari pertama, asal kedatangan pertama yang bukan
 * "Langsung", lalu jumlah halaman, kunjungan, dan lama dijumlahkan.
 */
function toPeople(visitorDays: VisitorDay[]): VisitorDay[] {
  const ordered = [...visitorDays].sort(
    (a, b) => a.first_seen_at.getTime() - b.first_seen_at.getTime(),
  );

  return [...groupBy(ordered, (day) => day.visitor_hash).values()].map(
    (days) => {
      const source =
        days.find((day) => day.source_category !== "direct") ?? days[0];

      return {
        ...days[0],
        source: source.source,
        source_category: source.source_category,
        pages: sum(days, (day) => day.pages),
        sessions: sum(days, (day) => day.sessions),
        duration: sum(days, (day) => day.duration),
      };
    },
  );
}

function averageSeconds(visitors: VisitorDay[]): number {
  if (visitors.length === 0) return 0;

  return Math.round(sum(visitors, (v) => v.duration) / visitors.length);
}

function byLatest(a: VisitorDay, b: VisitorDay): number {
  return b.last_seen_at.getTime() - a.last_seen_at.getTime();
}

/* ---------- Rekap ---------- */

function buildSeries(
  period: VisitorPeriod,
  today: string,
  visitorDays: VisitorDay[],
): SeriesBar[] {
  const [from, until] = rangeFor(period, today);
  const byBucket = groupBy(visitorDays, (day) => bucketKey(period, day.day));
  const bars: SeriesBar[] = [];

  for (
    let cursor = from;
    cursor <= until;
    cursor = nextBucket(period, cursor)
  ) {
    const people = toPeople(byBucket.get(bucketKey(period, cursor)) ?? []);
    const [label, hint] = bucketLabels(period, cursor);

    bars.push({
      label,
      hint,
      visitors: people.length,
      sessions: sum(people, (person) => person.sessions),
      pageviews: sum(people, (person) => person.pages),
      average_seconds: averageSeconds(people),
    });
  }

  return bars;
}

function buildBreakdown(
  visits: SiteVisit[],
  visitorDays: VisitorDay[],
): Breakdown {
  const people = toPeople(visitorDays);
  const located = people.filter((person) => person.province);

  const provinces = [...groupBy(located, (person) => person.province!)]
    .map(([name, group]) => ({
      name,
      visitors: group.length,
      cities: topCounts(
        group.flatMap((person) => (person.city ? [person.city] : [])),
        3,
      )
        .map((city) => city.name)
        .join(", "),
    }))
    .sort((a, b) => b.visitors - a.visitors);

  const cities = [
    ...groupBy(
      people.filter((person) => person.city),
      (person) => `${person.city}|${person.province ?? ""}`,
    ).values(),
  ]
    .map((group) => ({
      name: group[0].city!,
      province: group[0].province,
      visitors: group.length,
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 15);

  const sourceCategories = (
    Object.keys(SOURCE_CATEGORIES) as SourceCategory[]
  )
    .map((key) => ({
      key,
      name: SOURCE_CATEGORIES[key],
      count: people.filter((person) => person.source_category === key).length,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);

  const sources = [...groupBy(people, (person) => person.source)]
    .map(([name, group]) => ({
      name,
      category: group[0].source_category,
      count: group.length,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    visitors: people.length,
    sessions: sum(people, (person) => person.sessions),
    average_seconds: averageSeconds(people),
    provinces,
    cities,
    unknown_location: people.length - located.length,
    pages: topCounts(
      visits.map((visit) => visit.path),
      8,
    ),
    source_categories: sourceCategories,
    sources,
    devices: topCounts(
      people.map((person) => person.device ?? "Lainnya"),
      8,
    ),
    systems: topCounts(
      people.map((person) => person.os ?? "Lainnya"),
      8,
    ),
    browsers: topCounts(
      people.map((person) => person.browser ?? "Lainnya"),
      8,
    ),
  };
}

/* Menambahkan hari keberapa pengunjung datang dan tanggal kedatangan sebelumnya. */
async function withVisitHistory(
  rows: VisitorDay[],
): Promise<VisitorDayWithHistory[]> {
  const hashes = [...new Set(rows.map((row) => row.visitor_hash))];
  const history = await repository.listVisitDays(hashes);
  const daysByVisitor = groupBy(history, (row) => row.visitor_hash);

  return rows.map((row) => {
    const earlier = (daysByVisitor.get(row.visitor_hash) ?? [])
      .map((entry) => entry.day)
      .filter((day) => day < row.day)
      .sort();

    return {
      ...row,
      visit_day_number: earlier.length + 1,
      previous_day: earlier.at(-1) ?? null,
    };
  });
}

export function isVisitorPeriod(value: unknown): value is VisitorPeriod {
  return typeof value === "string" && value in VISITOR_PERIODS;
}

/*
 * Seluruh isi halaman Pengunjung dalam satu panggilan. aiLimit diisi bila
 * rincian pengunjung dari rekomendasi AI sedang dibuka.
 */
export async function getVisitorReport(
  period: VisitorPeriod,
  aiLimit: number | null,
): Promise<VisitorReport> {
  return withDbLogging("analytics.getVisitorReport", async () => {
    const today = jakartaDateKey(new Date());
    const [from, until] = rangeFor(period, today);

    /* Rentang periode selalu mencakup hari ini dan 7 hari terakhir. */
    const visits = await repository.listVisitsBetween(from, until);
    const visitorDays = toVisitorDays(visits);

    const todayVisitors = visitorDays.filter((day) => day.day === today);
    const todayHistory = await withVisitHistory(todayVisitors);

    const recentSince = addDays(today, -6);
    const recent = await withVisitHistory(
      visitorDays
        .filter((day) => day.day >= recentSince)
        .sort(byLatest)
        .slice(0, 15),
    );

    let fromAi: AiVisitors | null = null;
    if (aiLimit !== null) {
      const aiRows = visitorDays
        .filter((day) => day.source_category === "ai")
        .sort(byLatest);

      fromAi = {
        sources: topCounts(
          aiRows.map((row) => row.source),
          20,
        ),
        total: aiRows.length,
        visitors: await withVisitHistory(aiRows.slice(0, aiLimit)),
      };
    }

    return {
      today: {
        visitors: todayVisitors.length,
        returning: todayHistory.filter((row) => row.visit_day_number > 1)
          .length,
        sessions: sum(todayVisitors, (visitor) => visitor.sessions),
        pageviews: sum(todayVisitors, (visitor) => visitor.pages),
        average_seconds: averageSeconds(todayVisitors),
        from_search: todayVisitors.filter(
          (visitor) => visitor.source_category === "search",
        ).length,
        from_ai: todayVisitors.filter(
          (visitor) => visitor.source_category === "ai",
        ).length,
      },
      series: buildSeries(period, today, visitorDays),
      breakdown: buildBreakdown(visits, visitorDays),
      recent,
      fromAi,
    };
  });
}

export function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds} dtk`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mnt ${seconds % 60} dtk`;

  return `${Math.floor(minutes / 60)} jam ${minutes % 60} mnt`;
}
