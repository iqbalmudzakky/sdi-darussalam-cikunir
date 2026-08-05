import type { FacilityItem } from "@/types/Facility";

export async function listFacilities(): Promise<FacilityItem[]> {
  const res = await fetch("/api/facilities");
  if (!res.ok) throw new Error(`Failed to list facilities (${res.status})`);
  return res.json();
}

export async function createFacility(
  input: Omit<FacilityItem, "id">,
): Promise<FacilityItem> {
  const res = await fetch("/api/facilities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create facility (${res.status})`);
  return res.json();
}

export async function updateFacility(
  id: string,
  input: Omit<FacilityItem, "id">,
): Promise<FacilityItem> {
  const res = await fetch(`/api/facilities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update facility (${res.status})`);
  return res.json();
}

export async function deleteFacility(id: string): Promise<void> {
  const res = await fetch(`/api/facilities/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete facility (${res.status})`);
}
