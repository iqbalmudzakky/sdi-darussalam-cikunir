import { z } from "zod";

const MAX_DURATION_MS = 6 * 60 * 60 * 1000;

export const RecordDurationRequestSchema = z.object({
  visit_id: z.uuid("visit_id tidak valid."),
  duration_ms: z
    .number({ message: "duration_ms harus berupa angka." })
    .int("duration_ms harus bilangan bulat.")
    .min(0, "duration_ms tidak boleh negatif.")
    .max(MAX_DURATION_MS, "duration_ms di luar batas wajar."),
});

export type RecordDurationRequest = z.infer<typeof RecordDurationRequestSchema>;

export type VisitSummary = {
  total_visits: number;
  unique_visitors: number;
  visits_30d: number;
  unique_visitors_30d: number;
  avg_duration_ms: number | null;
  measured_visits: number;
};
