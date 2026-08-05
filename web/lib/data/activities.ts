import { createClient } from "@/lib/supabase/server";
import { removeStoragePhoto } from "@/lib/storage";
import type { ActivityItem } from "@/types/Activity";

const COLUMNS = "id, title, description, emoji, badge, photo_url";
const PHOTO_BUCKET = "activity-photos";

export async function listActivities(): Promise<ActivityItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select(COLUMNS)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function createActivity(
  input: Omit<ActivityItem, "id">,
): Promise<ActivityItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .insert(input)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateActivity(
  id: string,
  input: Omit<ActivityItem, "id">,
): Promise<ActivityItem> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("activities")
    .select("photo_url")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("activities")
    .update(input)
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;

  if (existing?.photo_url && existing.photo_url !== input.photo_url) {
    await removeStoragePhoto(supabase, PHOTO_BUCKET, existing.photo_url);
  }

  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id)
    .select("photo_url")
    .single();

  if (error) throw error;

  await removeStoragePhoto(supabase, PHOTO_BUCKET, data?.photo_url ?? null);
}
