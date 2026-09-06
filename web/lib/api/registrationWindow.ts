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
