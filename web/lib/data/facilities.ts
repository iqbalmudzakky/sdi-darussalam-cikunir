import { createClient } from "@/lib/supabase/server";
import type { FacilityItem } from "@/types/Facility";

const COLUMNS = "id, title, subtitle, emoji";

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
  const { data, error } = await supabase
    .from("facilities")
    .update(input)
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFacility(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("facilities").delete().eq("id", id);
  if (error) throw error;
}
