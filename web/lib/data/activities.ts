import { createClient } from "@/lib/supabase/server";
import type { ActivityItem } from "@/types/Activity";

const COLUMNS = "id, title, description, emoji, badge, photo_url";

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
  input: Omit<ActivityItem, "id">
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
  input: Omit<ActivityItem, "id">
): Promise<ActivityItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .update(input)
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) throw error;
}
