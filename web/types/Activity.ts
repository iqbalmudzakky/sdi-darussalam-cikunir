import type { Activity } from "@/modules/activity/entity";

export type ActivityItem = Omit<Activity, "created_at" | "updated_at">;
