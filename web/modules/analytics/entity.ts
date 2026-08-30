export type SiteVisit = {
  id: string;
  visitor_hash: string;
  duration_ms: number | null;
  visited_at: string;
};

export type VisitSummaryRow = {
  total_visits: number;
  unique_visitors: number;
  visits_30d: number;
  unique_visitors_30d: number;
  avg_duration_ms: number | null;
  measured_visits: number;
};
