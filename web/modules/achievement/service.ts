import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import type { SaveAchievementRequest, AchievementResponse } from "./dto";

export async function listAchievements(): Promise<AchievementResponse[]> {
  const achievements = await withDbLogging("achievement.list", () =>
    repository.list(),
  );

  const response: AchievementResponse[] = achievements.map((achievement) => ({
    id: achievement.id,
    emoji: achievement.emoji,
    title: achievement.title,
    description: achievement.description,
  }));

  return response;
}

export async function createAchievement(
  input: SaveAchievementRequest,
): Promise<AchievementResponse> {
  const created = await withDbLogging("achievement.insert", () =>
    repository.insert(input),
  );

  const response: AchievementResponse = {
    id: created.id,
    emoji: created.emoji,
    title: created.title,
    description: created.description,
  };

  return response;
}

export async function updateAchievement(
  id: string,
  input: SaveAchievementRequest,
): Promise<AchievementResponse> {
  const updated = await withDbLogging("achievement.update", () =>
    repository.update(id, input),
  );

  const response: AchievementResponse = {
    id: updated.id,
    emoji: updated.emoji,
    title: updated.title,
    description: updated.description,
  };

  return response;
}

export async function deleteAchievement(id: string): Promise<void> {
  await withDbLogging("achievement.remove", () => repository.remove(id));
}
