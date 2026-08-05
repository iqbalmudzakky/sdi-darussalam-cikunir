import type { ProgramItem } from "@/types/Program";

export async function listPrograms(): Promise<ProgramItem[]> {
  const res = await fetch("/api/programs");
  if (!res.ok) throw new Error(`Failed to list programs (${res.status})`);
  return res.json();
}

export async function createProgram(
  input: Omit<ProgramItem, "id">,
): Promise<ProgramItem> {
  const res = await fetch("/api/programs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create program (${res.status})`);
  return res.json();
}

export async function updateProgram(
  id: string,
  input: Omit<ProgramItem, "id">,
): Promise<ProgramItem> {
  const res = await fetch(`/api/programs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to update program (${res.status})`);
  return res.json();
}

export async function deleteProgram(id: string): Promise<void> {
  const res = await fetch(`/api/programs/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete program (${res.status})`);
}
