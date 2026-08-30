export async function recordVisit(signal: AbortSignal): Promise<string | null> {
  const res = await fetch("/api/analytics/visits", {
    method: "POST",
    signal,
  });

  if (!res.ok) throw new Error(`Failed to record visit (${res.status})`);

  const data: { id: string | null } = await res.json();
  return data.id;
}

export function recordVisitDuration(visitId: string, durationMs: number): void {
  navigator.sendBeacon(
    "/api/analytics/visits/duration",
    new Blob([JSON.stringify({ visit_id: visitId, duration_ms: durationMs })], {
      type: "application/json",
    }),
  );
}
