import type { ActivityItem } from "@/types/Activity";

export async function listActivities(): Promise<ActivityItem[]> {
  const res = await fetch("/api/activities");
  if (!res.ok) throw new Error(`Failed to list activities (${res.status})`);
  return res.json();
}

export async function createActivity(
  input: Omit<ActivityItem, "id">,
): Promise<ActivityItem> {
  const res = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create activity (${res.status})`);
  return res.json();
}

export async function updateActivity(
  id: string,
  input: Omit<ActivityItem, "id">,
): Promise<ActivityItem> {
  const res = await fetch(`/api/activities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update activity (${res.status})`);
  return res.json();
}

export async function deleteActivity(id: string): Promise<void> {
  const res = await fetch(`/api/activities/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete activity (${res.status})`);
}
