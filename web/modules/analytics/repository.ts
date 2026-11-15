import { sql } from "@/modules/db/postgres";
import type {
  NewSiteVisit,
  SiteVisit,
  VisitorDayKey,
  VisitSummaryRow,
} from "./entity";

/* Detak yang datang setelah jeda selama ini dianggap kunjungan yang sudah selesai. */
const PING_GAP_MINUTES = 30;

/* Batas wajar satu halaman dibuka, supaya tab yang terlupa tidak membengkakkan rata-rata. */
const MAX_DURATION_SECONDS = 4 * 3600;

/* Rekap bulanan tetap bisa dibandingkan setahun ke belakang. */
const KEEP_DAYS = 400;

const VISIT_COLUMNS = `
  id, day::text AS day, visitor_hash, ip_address, path, referrer_host,
  utm_source, country_code, province, city, device, os, browser,
  visited_at, last_seen_at, duration_ms`;

/* ID dibuat browser, jadi "start" yang terkirim dua kali cukup diabaikan. */
export async function insertVisit(visit: NewSiteVisit): Promise<void> {
  await sql.unsafe(
    `INSERT INTO site_visits (
       id, day, visitor_hash, ip_address, path, referrer_host, utm_source,
       country_code, province, city, device, os, browser,
       visited_at, last_seen_at, duration_ms
     ) VALUES (
       $1, $2::date, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
       now(), now(), 0
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      visit.id,
      visit.day,
      visit.visitor_hash,
      visit.ip_address,
      visit.path,
      visit.referrer_host,
      visit.utm_source,
      visit.country_code,
      visit.province,
      visit.city,
      visit.device,
      visit.os,
      visit.browser,
    ],
  );
}

/*
 * Lama kunjungan memakai detik halaman benar-benar terlihat yang dihitung
 * browser, tetapi tidak pernah melebihi selisih waktu sejak halaman dibuka
 * menurut server, dan tidak pernah turun dari nilai yang sudah tercatat.
 * Sidik ikut dicocokkan supaya ID milik orang lain tidak bisa diubah.
 */
export async function touchVisit(
  id: string,
  visitorHash: string,
  visibleSeconds: number | null,
): Promise<void> {
  await sql.unsafe(
    `UPDATE site_visits
        SET last_seen_at = now(),
            duration_ms = GREATEST(
              COALESCE(duration_ms, 0),
              1000 * LEAST(
                $4::int,
                EXTRACT(EPOCH FROM (now() - visited_at))::int,
                COALESCE($3::int, EXTRACT(EPOCH FROM (now() - visited_at))::int)
              )
            )
      WHERE id = $1
        AND visitor_hash = $2
        AND last_seen_at >= now() - make_interval(mins => $5::int)`,
    [id, visitorHash, visibleSeconds, MAX_DURATION_SECONDS, PING_GAP_MINUTES],
  );
}

/* Semua halaman yang dibuka dalam rentang tanggal WIB, urut waktu buka. */
export async function listVisitsBetween(
  fromDay: string,
  untilDay: string,
): Promise<SiteVisit[]> {
  return sql.unsafe<SiteVisit[]>(
    `SELECT ${VISIT_COLUMNS}
       FROM site_visits
      WHERE day BETWEEN $1::date AND $2::date
      ORDER BY visited_at`,
    [fromDay, untilDay],
  );
}

/* Hari-hari kedatangan tiap sidik, untuk mengenali pengunjung yang kembali. */
export async function listVisitDays(
  visitorHashes: string[],
): Promise<VisitorDayKey[]> {
  if (visitorHashes.length === 0) return [];

  return sql.unsafe<VisitorDayKey[]>(
    `SELECT DISTINCT visitor_hash, day::text AS day
       FROM site_visits
      WHERE visitor_hash = ANY(string_to_array($1, ','))`,
    [visitorHashes.join(",")],
  );
}

export async function deleteOldVisits(): Promise<number> {
  const rows = await sql.unsafe(
    `DELETE FROM site_visits
      WHERE day < (now() AT TIME ZONE 'Asia/Jakarta')::date - $1::int
      RETURNING id`,
    [KEEP_DAYS],
  );

  return rows.length;
}

export async function getSummary(): Promise<VisitSummaryRow> {
  const rows = await sql.unsafe<VisitSummaryRow[]>(
    `SELECT
       COUNT(*)::int AS total_visits,
       COUNT(DISTINCT visitor_hash)::int AS unique_visitors,

       (COUNT(*) FILTER (
          WHERE visited_at >= now() - interval '30 days'
        ))::int AS visits_30d,

       (COUNT(DISTINCT visitor_hash) FILTER (
          WHERE visited_at >= now() - interval '30 days'
        ))::int AS unique_visitors_30d,

       (COUNT(DISTINCT visitor_hash) FILTER (
          WHERE (visited_at AT TIME ZONE 'Asia/Jakarta')::date
              = (now() AT TIME ZONE 'Asia/Jakarta')::date
        ))::int AS unique_visitors_today,

       ROUND(AVG(duration_ms))::int AS avg_duration_ms,

       (COUNT(*) FILTER (WHERE duration_ms IS NOT NULL))::int AS measured_visits
     FROM site_visits`,
  );

  return rows[0];
}
