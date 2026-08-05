import type { HeroContent } from "@/types/Hero";

export async function getHeroContent(): Promise<HeroContent> {
  const res = await fetch("/api/hero");
  if (!res.ok) throw new Error(`Failed to load hero content (${res.status})`);
  return res.json();
}

export async function updateHeroContent(
  input: HeroContent,
): Promise<HeroContent> {
  const res = await fetch("/api/hero", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to save hero content (${res.status})`);
  return res.json();
}
