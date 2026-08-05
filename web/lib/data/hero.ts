import { createClient } from "@/lib/supabase/server";
import { removeStoragePhoto } from "@/lib/storage";
import type { HeroContent } from "@/types/Hero";

const COLUMNS =
  "headline_main, headline_highlight, description, stat1_value, stat2_value, stat3_value, photo_url";
const PHOTO_BUCKET = "hero-photos";

export const DEFAULT_HERO_CONTENT: HeroContent = {
  headline_main: "Membentuk Generasi",
  headline_highlight: "Cerdas & Berakhlak Mulia",
  description:
    "SDI Darussalam Cikunir, Bekasi Selatan - Lembaga pendidikan yang mengintegrasikan kurikulum nasional dengan nilai-nilai keislaman untuk menghasilkan siswa yang unggul dalam prestasi dan karakter.",
  stat1_value: "15+",
  stat2_value: "500+",
  stat3_value: "30+",
  photo_url: null,
};

export async function getHeroContent(): Promise<HeroContent> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hero_content")
    .select(COLUMNS)
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  return data ?? DEFAULT_HERO_CONTENT;
}

export async function updateHeroContent(
  input: HeroContent,
): Promise<HeroContent> {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("hero_content")
    .select("photo_url")
    .eq("id", 1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("hero_content")
    .upsert({ id: 1, ...input })
    .select(COLUMNS)
    .single();

  if (error) throw error;

  if (existing?.photo_url && existing.photo_url !== input.photo_url) {
    await removeStoragePhoto(supabase, PHOTO_BUCKET, existing.photo_url);
  }

  return data;
}
