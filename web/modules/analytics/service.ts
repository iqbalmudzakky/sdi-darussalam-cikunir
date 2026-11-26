import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import { buildStableVisitorHash, isBot } from "@/modules/visitor/visitor";
import { detectDevice, detectSystem } from "@/modules/visitor/device";
import { lookupLocation } from "@/modules/visitor/location";
import { jakartaDateKey } from "@/modules/shared/date/jakartaDate";
import type { TrackVisitRequest, VisitSummary } from "./dto";

type TrackContext = {
  ip: string;
  userAgent: string;

  /* Nama host situs ini sendiri, supaya pindah halaman tidak terbaca sebagai asal luar. */
  ownHosts: string[];
};

function stripWww(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function referrerHost(
  referrer: string | null | undefined,
  ownHosts: string[],
): string | null {
  if (!referrer) return null;

  let host: string;
  try {
    host = stripWww(new URL(referrer).hostname);
  } catch {
    return null;
  }

  if (!host || ownHosts.map(stripWww).includes(host)) return null;

  return host.slice(0, 250);
}

/* Query string dan tanda pagar dibuang: yang dicatat hanya halamannya. */
function cleanPath(path: string): string {
  return (path.split(/[?#]/)[0] || "/").slice(0, 250);
}

export async function trackVisit(
  data: TrackVisitRequest,
  context: TrackContext,
): Promise<void> {
  if (isBot(context.userAgent)) return;

  const visitorHash = buildStableVisitorHash({
    ip: context.ip,
    userAgent: context.userAgent,
    salt: process.env.ANALYTICS_SALT ?? "",
  });

  if (data.event !== "start") {
    return withDbLogging("analytics.touchVisit", () =>
      repository.touchVisit(data.id, visitorHash, data.seconds ?? null),
    );
  }

  if (!data.path) return;

  const location = await lookupLocation(context.ip);
  const system = detectSystem(context.userAgent);
  const utm = (data.utm ?? "").trim().toLowerCase();

  return withDbLogging("analytics.insertVisit", () =>
    repository.insertVisit({
      id: data.id,
      day: jakartaDateKey(new Date()),
      visitor_hash: visitorHash,
      ip_address: context.ip,
      path: cleanPath(data.path!),
      referrer_host: referrerHost(data.referrer, context.ownHosts),
      utm_source: utm ? utm.slice(0, 100) : null,
      country_code: location.country_code,
      province: location.province,
      city: location.city,
      device: detectDevice(data.width, context.userAgent),
      os: system.os,
      browser: system.browser,
    }),
  );
}

export async function getVisitSummary(): Promise<VisitSummary> {
  return withDbLogging("analytics.getSummary", () => repository.getSummary());
}

export async function cleanupOldVisits(): Promise<number> {
  return withDbLogging("analytics.deleteOldVisits", () =>
    repository.deleteOldVisits(),
  );
}
