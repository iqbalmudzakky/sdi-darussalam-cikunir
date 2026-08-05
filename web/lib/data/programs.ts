import { createClient } from "@/lib/supabase/server";
import type { ProgramItem } from "@/types/Program";

const COLUMNS = "id, title, description, emoji";

export async function listPrograms(): Promise<ProgramItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select(COLUMNS)
    .order("created_at");

  if (error) throw error;
  return data;
}

export async function createProgram(
  input: Omit<ProgramItem, "id">,
): Promise<ProgramItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .insert(input)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function updateProgram(
  id: string,
  input: Omit<ProgramItem, "id">,
): Promise<ProgramItem> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .update(input)
    .eq("id", id)
    .select(COLUMNS)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProgram(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);
  if (error) throw error;
}
