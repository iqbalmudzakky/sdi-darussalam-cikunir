import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import type { Achievement } from "./entity";
import type { SaveAchievementRequest } from "./dto";

export async function listAchievements(): Promise<Achievement[]> {
  return withDbLogging("achievement.list", () => repository.list());
}

export async function createAchievement(
  input: SaveAchievementRequest,
): Promise<Achievement> {
  return withDbLogging("achievement.insert", () => repository.insert(input));
}

export async function updateAchievement(
  id: string,
  input: SaveAchievementRequest,
): Promise<Achievement> {
  return withDbLogging("achievement.update", () =>
    repository.update(id, input),
  );
}

export async function deleteAchievement(id: string): Promise<void> {
  await withDbLogging("achievement.remove", () => repository.remove(id));
}
