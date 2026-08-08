import type {
  Registration,
  SubmitRegistrationInput,
  UpdateRegistrationStatusInput,
} from "@/types/Registration";

export async function listRegistrations(): Promise<Registration[]> {
  const res = await fetch("/api/registrations");
  if (!res.ok) throw new Error(`Failed to list registrations (${res.status})`);
  return res.json();
}

export async function deleteRegistration(id: string): Promise<void> {
  const res = await fetch(`/api/registrations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete registration (${res.status})`);
}

export async function submitRegistration(
  input: SubmitRegistrationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch("/api/registrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.error ?? "Gagal mengirim pendaftaran." };
  }

  return { ok: true };
}

export async function updateRegistrationStatus(
  id: string,
  input: UpdateRegistrationStatusInput,
): Promise<Registration> {
  const res = await fetch(`/api/registrations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(`Failed to update registration status (${res.status})`);
  return res.json();
}

export async function getPendingFollowUpCount(): Promise<number> {
  const res = await fetch("/api/registrations/pending-count");
  if (!res.ok) throw new Error(`Failed to get pending count (${res.status})`);
  const data = await res.json();
  return data.count;
}
