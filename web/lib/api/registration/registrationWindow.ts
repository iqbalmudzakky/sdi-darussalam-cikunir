import type {
  ShortFormOptions,
  ShortFormOptionsQuery,
} from "@/types/registration/Registration";

/* no-store: status ini tidak boleh ikut cache ISR halaman landing. */
export async function fetchRegistrationOpen(): Promise<boolean> {
  try {
    const res = await fetch("/api/registration-window", { cache: "no-store" });
    if (!res.ok) {
      console.error(`fetchRegistrationOpen failed: HTTP ${res.status}`);
      return false;
    }

    const data = await res.json();
    return Boolean(data.open);
  } catch (error) {
    console.error("fetchRegistrationOpen failed:", error);
    return false;
  }
}

export async function fetchShortFormOptions(
  query: ShortFormOptionsQuery,
): Promise<ShortFormOptions | null> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }

  try {
    const url = `/api/registration-window?${params.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(`fetchShortFormOptions failed: HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("fetchShortFormOptions failed:", error);
    return null;
  }
}
