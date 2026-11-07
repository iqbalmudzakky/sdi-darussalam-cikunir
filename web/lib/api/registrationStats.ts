import type { AcademicYearSummary } from "@/types/RegistrationStats";

export async function getAcademicYears(): Promise<AcademicYearSummary[]> {
  try {
    const res = await fetch("/api/registration-stats");
    if (!res.ok)
      throw new Error(`Failed to load registration stats (${res.status})`);
    return await res.json();
  } catch (error) {
    console.error("getAcademicYears failed:", error);
    throw error;
  }
}

export async function addAcademicYear(
  academicYear: string,
): Promise<
  { ok: true; data: AcademicYearSummary } | { ok: false; error: string }
> {
  try {
    const res = await fetch("/api/registration-stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ academic_year: academicYear }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { ok: false, error: data.error ?? "Gagal menambah tahun ajaran." };
    }

    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error("addAcademicYear failed:", error);
    return { ok: false, error: "Gagal menambah tahun ajaran." };
  }
}

export async function saveOfflineCount(
  academicYear: string,
  offlineCount: number,
): Promise<
  { ok: true; data: AcademicYearSummary } | { ok: false; error: string }
> {
  const body = { academic_year: academicYear, offline_count: offlineCount };

  try {
    const res = await fetch("/api/registration-stats", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: data.error ?? "Gagal menyimpan jumlah pendaftar offline.",
      };
    }

    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error("saveOfflineCount failed:", error);
    return {
      ok: false,
      error: "Gagal menyimpan jumlah pendaftar offline.",
    };
  }
}

export async function setCurrentAcademicYear(
  academicYear: string,
): Promise<
  { ok: true; data: AcademicYearSummary } | { ok: false; error: string }
> {
  try {
    const res = await fetch("/api/registration-stats/current", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ academic_year: academicYear }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        ok: false,
        error: data.error ?? "Gagal mengubah tahun ajaran aktif.",
      };
    }

    return { ok: true, data: await res.json() };
  } catch (error) {
    console.error("setCurrentAcademicYear failed:", error);
    return {
      ok: false,
      error: "Gagal mengubah tahun ajaran aktif.",
    };
  }
}
