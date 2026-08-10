import * as repository from "./repository";
import { withDbLogging } from "@/modules/db/errors";
import { createClient } from "@/lib/supabase/server";
import { removeStoragePhoto } from "@/lib/storage";
import type { Activity } from "./entity";
import type { SaveActivityRequest } from "./dto";

const PHOTO_BUCKET = "activity-photos";

export async function listActivities(): Promise<Activity[]> {
  return withDbLogging("activity.list", () => repository.list());
}

export async function createActivity(
  input: SaveActivityRequest,
): Promise<Activity> {
  return withDbLogging("activity.insert", () => repository.insert(input));
}

export async function updateActivity(
  id: string,
  input: SaveActivityRequest,
): Promise<Activity> {
  const existing = await withDbLogging("activity.findById", () =>
    repository.findById(id),
  );

  const updated = await withDbLogging("activity.update", () =>
    repository.update(id, input),
  );

  if (existing?.photo_url && existing.photo_url !== input.photo_url) {
    const supabase = await createClient();
    await removeStoragePhoto(supabase, PHOTO_BUCKET, existing.photo_url);
  }

  return updated;
}

export async function deleteActivity(id: string): Promise<void> {
  const existing = await withDbLogging("activity.findById", () =>
    repository.findById(id),
  );

  await withDbLogging("activity.remove", () => repository.remove(id));

  if (existing?.photo_url) {
    const supabase = await createClient();
    await removeStoragePhoto(supabase, PHOTO_BUCKET, existing.photo_url);
  }
}
