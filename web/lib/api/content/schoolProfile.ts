import type { SchoolProfile, SchoolProfileStats } from "@/types/content/SchoolProfile";

export async function getSchoolProfile(): Promise<SchoolProfile> {
  const res = await fetch("/api/school-profile");
  if (!res.ok) throw new Error(`Failed to load school profile (${res.status})`);
  return res.json();
}

export async function updateSchoolProfile(
  input: SchoolProfile,
): Promise<SchoolProfile> {
  const res = await fetch("/api/school-profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to save school profile (${res.status})`);
  return res.json();
}

export async function getSchoolProfileStats(): Promise<SchoolProfileStats> {
  try {
    const res = await fetch("/api/school-profile/stats");
    if (!res.ok)
      throw new Error(`Failed to load school profile stats (${res.status})`);
    return await res.json();
  } catch (error) {
    console.error("getSchoolProfileStats failed:", error);
    throw error;
  }
}
