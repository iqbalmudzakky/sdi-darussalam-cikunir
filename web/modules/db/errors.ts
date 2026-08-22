export async function withDbLogging<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[db] ${label} failed:`, error);
    throw new Error("Terjadi kesalahan pada server.");
  }
}
