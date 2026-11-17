import {
  SCHOOL_NPSN,
  SSO_REQUEST_TIMEOUT_MS,
} from "@/modules/shared/constant/sso";
import type { SchoolProfileStatsInput } from "@/modules/school-profile/entity";

export type FetchSchoolStatsResult =
  { ok: true; stats: SchoolProfileStatsInput } | { ok: false; message: string };

type SsoStatsBody = {
  data?: {
    siswa_aktif?: unknown;
    guru_staf?: unknown;
  };
};

export async function fetchSchoolStats(): Promise<FetchSchoolStatsResult> {
  const baseUrl = process.env.SSO_BASE_URL;
  const token = process.env.SSO_PMB_TOKEN;
  if (!baseUrl || !token) {
    return { ok: false, message: "SSO_BASE_URL or SSO_PMB_TOKEN is not set" };
  }

  const url = `${baseUrl}/api/v1/pmb/sekolah/${SCHOOL_NPSN}/statistik`;
  const requestInit: RequestInit = {
    headers: {
      "X-PMB-Token": token,
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(SSO_REQUEST_TIMEOUT_MS),
    cache: "no-store",
  };

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    return { ok: false, message: `SSO request failed: ${String(error)}` };
  }

  if (!response.ok) {
    return { ok: false, message: `SSO responded ${response.status}` };
  }

  const body = (await response.json().catch(() => null)) as SsoStatsBody | null;
  const activeStudentCount = body?.data?.siswa_aktif;
  const staffCount = body?.data?.guru_staf;

  if (
    typeof activeStudentCount !== "number" ||
    !Number.isInteger(activeStudentCount) ||
    activeStudentCount <= 0 ||
    typeof staffCount !== "number" ||
    !Number.isInteger(staffCount) ||
    staffCount <= 0
  ) {
    return {
      ok: false,
      message: `SSO returned implausible counts: siswa_aktif=${String(activeStudentCount)}, guru_staf=${String(staffCount)}`,
    };
  }

  const stats: SchoolProfileStatsInput = {
    activeStudentCount,
    staffCount,
  };

  return { ok: true, stats };
}
