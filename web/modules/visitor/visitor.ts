import { createHash } from "crypto";
import { jakartaDateKey } from "@/modules/shared/jakartaDate";

const BOT_PATTERN =
  /bot\b|bots?\/|crawl|spider|slurp|bingpreview|yandex|baidu|duckduck|facebookexternalhit|whatsapp|telegram|discord|slack|embedly|preview|monitor|uptime|pingdom|headless|lighthouse|curl\/|wget|python-requests|axios\/|node-fetch/i;

export function isBot(userAgent: string): boolean {
  if (!userAgent.trim()) return true;

  return BOT_PATTERN.test(userAgent);
}

export type BuildVisitorHashInput = {
  ip: string;
  userAgent: string;
  salt: string;
  now: Date;
};

export function buildVisitorHash(input: BuildVisitorHashInput): string {
  if (!input.salt) {
    throw new Error(
      "ANALYTICS_SALT is not set — refusing to hash visitors without it.",
    );
  }

  return createHash("sha256")
    .update(
      `${input.ip}|${input.userAgent}|${input.salt}|${jakartaDateKey(input.now)}`,
    )
    .digest("hex");
}
