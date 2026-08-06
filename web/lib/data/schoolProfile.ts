import { createClient } from "@/lib/supabase/server";
import { removeStoragePhoto } from "@/lib/storage";
import type { SchoolProfile } from "@/types/SchoolProfile";

const COLUMNS =
  "photo_url, description, visi, misi, alamat, telepon, email, jam_operasional, facebook, instagram, tiktok, youtube";
const PHOTO_BUCKET = "school-profile-photos";

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  photo_url: null,
  description: "",
  visi: "",
  misi: [],
  alamat: "",
  telepon: "",
  email: "",
  jam_operasional: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  youtube: "",
};

export async function getSchoolProfile(): Promise<SchoolProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("school_profiles")
    .select(COLUMNS)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? DEFAULT_SCHOOL_PROFILE;
}

export async function updateSchoolProfile(
  input: SchoolProfile,
): Promise<SchoolProfile> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("school_profiles")
    .select("id, photo_url")
    .order("created_at")
    .limit(1)
    .maybeSingle();

  const { data, error } = existing
    ? await supabase
        .from("school_profiles")
        .update(input)
        .eq("id", existing.id)
        .select(COLUMNS)
        .single()
    : await supabase
        .from("school_profiles")
        .insert(input)
        .select(COLUMNS)
        .single();

  if (error) throw error;

  if (existing?.photo_url && existing.photo_url !== input.photo_url) {
    await removeStoragePhoto(supabase, PHOTO_BUCKET, existing.photo_url);
  }

  return data;
}
