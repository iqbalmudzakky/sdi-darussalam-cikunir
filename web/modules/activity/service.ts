import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import { removeStoragePhoto } from "@/modules/storage/storage";
import type { SaveActivityRequest, ActivityResponse } from "./dto";

const PHOTO_BUCKET = "activity-photos";

export async function listActivities(): Promise<ActivityResponse[]> {
  const activities = await withDbLogging("activity.list", () =>
    repository.list(),
  );

  const response: ActivityResponse[] = activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    emoji: activity.emoji,
    badge: activity.badge,
    photo_url: activity.photo_url,
    youtube_url: activity.youtube_url,
  }));

  return response;
}

export async function createActivity(
  input: SaveActivityRequest,
): Promise<ActivityResponse> {
  const created = await withDbLogging("activity.insert", () =>
    repository.insert(input),
  );

  const response: ActivityResponse = {
    id: created.id,
    title: created.title,
    description: created.description,
    emoji: created.emoji,
    badge: created.badge,
    photo_url: created.photo_url,
    youtube_url: created.youtube_url,
  };

  return response;
}

export async function updateActivity(
  id: string,
  input: SaveActivityRequest,
): Promise<ActivityResponse> {
  const existing = await withDbLogging("activity.findById", () =>
    repository.findById(id),
  );

  const updated = await withDbLogging("activity.update", () =>
    repository.update(id, input),
  );

  if (existing?.photo_url && existing.photo_url !== input.photo_url) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.photo_url);
  }

  const response: ActivityResponse = {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    emoji: updated.emoji,
    badge: updated.badge,
    photo_url: updated.photo_url,
    youtube_url: updated.youtube_url,
  };

  return response;
}

export async function deleteActivity(id: string): Promise<void> {
  const existing = await withDbLogging("activity.findById", () =>
    repository.findById(id),
  );

  await withDbLogging("activity.remove", () => repository.remove(id));

  if (existing?.photo_url) {
    await removeStoragePhoto(PHOTO_BUCKET, existing.photo_url);
  }
}
