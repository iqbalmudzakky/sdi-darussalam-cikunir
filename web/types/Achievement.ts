import type { Achievement } from "@/modules/achievement/entity";

export type AchievementItem = Omit<Achievement, "created_at" | "updated_at">;
