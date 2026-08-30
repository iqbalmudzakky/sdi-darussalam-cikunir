"use server";

import * as analyticsService from "@/modules/analytics/service";
import type { VisitSummary } from "@/modules/analytics/dto";

const EMPTY_SUMMARY: VisitSummary = {
  total_visits: 0,
  unique_visitors: 0,
  visits_30d: 0,
  unique_visitors_30d: 0,
  avg_duration_ms: null,
  measured_visits: 0,
};

export async function getVisitSummary(): Promise<VisitSummary> {
  try {
    return await analyticsService.getVisitSummary();
  } catch (error) {
    console.error("lib/actions/analytics.getVisitSummary failed:", error);
    return EMPTY_SUMMARY;
  }
}
