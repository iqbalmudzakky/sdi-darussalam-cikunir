"use server";

import * as activityService from "@/modules/activity/service";
import type { Activity } from "@/modules/activity/entity";

export async function listActivities(): Promise<Activity[]> {
  try {
    return await activityService.listActivities();
  } catch (error) {
    console.error("lib/actions/activities.listActivities failed:", error);
    return [];
  }
}
