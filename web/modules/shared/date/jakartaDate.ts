export function jakartaDateKey(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function jakartaMidnight(dateOnly: string): string {
  return `${dateOnly}T00:00:00+07:00`;
}
