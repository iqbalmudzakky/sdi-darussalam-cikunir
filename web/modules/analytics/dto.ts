import { z } from "zod";

/*
 * Detak kunjungan dari browser: "start" saat halaman dibuka, "ping" berkala
 * selama halaman terlihat, dan "end" saat ditutup. ID dibuat browser, jadi
 * detak berikutnya cukup menyebut ID yang sama tanpa menunggu jawaban server.
 */
export const TrackVisitRequestSchema = z.object({
  id: z.uuid(),
  event: z.enum(["start", "ping", "end"]),
  path: z.string().max(255).startsWith("/").optional(),
  referrer: z.string().max(2000).nullish(),
  utm: z.string().max(100).nullish(),
  width: z.number().int().min(0).max(20000).nullish(),
  seconds: z.number().int().min(0).nullish(),
});

export type TrackVisitRequest = z.infer<typeof TrackVisitRequestSchema>;

export type VisitSummary = {
  total_visits: number;
  unique_visitors: number;
  unique_visitors_today: number;
  visits_30d: number;
  unique_visitors_30d: number;
  avg_duration_ms: number | null;
  measured_visits: number;
};
