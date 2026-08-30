import { sql } from "@/modules/db/postgres";
import type { SiteVisit, VisitSummaryRow } from "./entity";

export async function insertVisit(visitorHash: string): Promise<string | null> {
  const rows = await sql.unsafe<Pick<SiteVisit, "id">[]>(
    `INSERT INTO site_visits (visitor_hash) VALUES ($1) RETURNING id`,
    [visitorHash],
  );

  return rows[0]?.id ?? null;
}

export async function updateDuration(
  id: string,
  durationMs: number,
): Promise<void> {
  await sql.unsafe(
    `UPDATE site_visits
       SET duration_ms = $2
     WHERE id = $1
       AND duration_ms IS NULL`,
    [id, durationMs],
  );
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

       ROUND(AVG(duration_ms))::int AS avg_duration_ms,

       (COUNT(*) FILTER (WHERE duration_ms IS NOT NULL))::int AS measured_visits
     FROM site_visits`,
  );

  return rows[0];
}
