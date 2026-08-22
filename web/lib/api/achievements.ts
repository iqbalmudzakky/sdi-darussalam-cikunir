import type { AchievementItem } from "@/types/Achievement";

export async function listAchievements(): Promise<AchievementItem[]> {
  const res = await fetch("/api/achievements");
  if (!res.ok) throw new Error(`Failed to list achievements (${res.status})`);
  return res.json();
}

export async function createAchievement(
  input: Omit<AchievementItem, "id">,
): Promise<AchievementItem> {
  const res = await fetch("/api/achievements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create achievement (${res.status})`);
  return res.json();
}

export async function updateAchievement(
  id: string,
  input: Omit<AchievementItem, "id">,
): Promise<AchievementItem> {
  const res = await fetch(`/api/achievements/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update achievement (${res.status})`);
  return res.json();
}

export async function deleteAchievement(id: string): Promise<void> {
  const res = await fetch(`/api/achievements/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete achievement (${res.status})`);
}
