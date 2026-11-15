/*
 * Satu halaman publik yang dibuka pengunjung. visitor_hash sama untuk alamat
 * IP dan browser yang sama di hari mana pun. day adalah tanggal WIB (Y-m-d).
 *
 * Baris sebelum 16 November 2026 hanya punya sidik harian, tanpa IP, lokasi,
 * atau perangkat, sehingga kolom-kolom itu bisa kosong.
 */
export type SiteVisit = {
  id: string;
  day: string;
  visitor_hash: string;
  ip_address: string | null;
  path: string;
  referrer_host: string | null;
  utm_source: string | null;
  country_code: string | null;
  province: string | null;
  city: string | null;
  device: string | null;
  os: string | null;
  browser: string | null;
  visited_at: Date;
  last_seen_at: Date;
  duration_ms: number | null;
};

export type NewSiteVisit = Omit<
  SiteVisit,
  "visited_at" | "last_seen_at" | "duration_ms"
>;

export type VisitorDayKey = Pick<SiteVisit, "visitor_hash" | "day">;

export type VisitSummaryRow = {
  total_visits: number;
  unique_visitors: number;
  unique_visitors_today: number;
  visits_30d: number;
  unique_visitors_30d: number;
  avg_duration_ms: number | null;
  measured_visits: number;
};
