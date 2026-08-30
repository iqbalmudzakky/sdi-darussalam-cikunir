import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import {
  buildVisitorHash,
  isBot,
  BuildVisitorHashInput,
} from "@/modules/visitor/visitor";
import type { VisitSummary } from "./dto";

export async function recordVisit(
  ip: string,
  userAgent: string,
): Promise<string | null> {
  if (isBot(userAgent)) return null;

  const input: BuildVisitorHashInput = {
    ip,
    userAgent,
    salt: process.env.ANALYTICS_SALT ?? "",
    now: new Date(),
  };

  const visitorHash = buildVisitorHash(input);

  return withDbLogging("analytics.insertVisit", () =>
    repository.insertVisit(visitorHash),
  );
}

export async function recordDuration(
  visitId: string,
  durationMs: number,
): Promise<void> {
  return withDbLogging("analytics.updateDuration", () =>
    repository.updateDuration(visitId, durationMs),
  );
}

export async function getVisitSummary(): Promise<VisitSummary> {
  return withDbLogging("analytics.getSummary", () => repository.getSummary());
}
