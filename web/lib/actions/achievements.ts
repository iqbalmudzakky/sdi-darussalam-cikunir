"use server";

import * as achievementService from "@/modules/achievement/service";
import type { Achievement } from "@/modules/achievement/entity";

export async function listAchievements(): Promise<Achievement[]> {
  try {
    return await achievementService.listAchievements();
  } catch (error) {
    console.error("lib/actions/achievements.listAchievements failed:", error);
    return [];
  }
}
