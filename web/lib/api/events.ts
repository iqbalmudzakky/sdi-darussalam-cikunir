import type { EventItem } from "@/types/Event";

export async function listEvents(): Promise<EventItem[]> {
  try {
    const res = await fetch("/api/events");
    if (!res.ok) throw new Error(`Failed to list events (${res.status})`);
    return await res.json();
  } catch (error) {
    console.error("listEvents failed:", error);
    throw error;
  }
}

export async function createEvent(
  input: Omit<EventItem, "id" | "slug">,
): Promise<{ ok: true; data: EventItem } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "Gagal membuat event." };
    }

    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error("createEvent failed:", error);
    return { ok: false, error: "Gagal membuat event." };
  }
}

export async function updateEvent(
  id: string,
  input: Omit<EventItem, "id" | "slug">,
): Promise<{ ok: true; data: EventItem } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "Gagal menyimpan event." };
    }

    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error("updateEvent failed:", error);
    return { ok: false, error: "Gagal menyimpan event." };
  }
}

export async function deleteEvent(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "Gagal menghapus event." };
    }

    return { ok: true };
  } catch (error) {
    console.error("deleteEvent failed:", error);
    return { ok: false, error: "Gagal menghapus event." };
  }
}
