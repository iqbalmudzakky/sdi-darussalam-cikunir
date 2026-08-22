"use server";

import * as activityService from "@/modules/activity/service";
import type { ActivityItem } from "@/types/Activity";

export async function listActivities(): Promise<ActivityItem[]> {
  try {
    return await activityService.listActivities();
  } catch (error) {
    console.error("lib/actions/activities.listActivities failed:", error);
    return [];
  }
}
