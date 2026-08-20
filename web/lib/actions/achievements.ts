"use server";

import * as achievementService from "@/modules/achievement/service";
import type { AchievementItem } from "@/types/Achievement";

export async function listAchievements(): Promise<AchievementItem[]> {
  try {
    return await achievementService.listAchievements();
  } catch (error) {
    console.error("lib/actions/achievements.listAchievements failed:", error);
    return [];
  }
}
