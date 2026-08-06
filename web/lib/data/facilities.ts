import { createClient } from "@/lib/supabase/server";
import { removeStoragePhoto } from "@/lib/storage";
import type { FacilityItem } from "@/types/Facility";

const COLUMNS = "id, title, subtitle, emoji, photo_url";
const PHOTO_BUCKET = "facility-photos";

export async function listFacilities(): Promise<FacilityItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facilities")
    .select(COLUMNS)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function createFacility(
  input: Omit<FacilityItem, "id">,
): Promise<FacilityItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facilities")
    .insert(input)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateFacility(
  id: string,
  input: Omit<FacilityItem, "id">,
): Promise<FacilityItem> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("facilities")
    .select("photo_url")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("facilities")
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

export async function deleteFacility(id: string): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("facilities")
    .delete()
    .eq("id", id)
    .select("photo_url")
    .single();

  if (error) throw error;

  await removeStoragePhoto(supabase, PHOTO_BUCKET, data?.photo_url ?? null);
}
