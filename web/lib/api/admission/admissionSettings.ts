import type {
  AdmissionSettingsPayload,
  SaveAdmissionSettingsResult,
} from "@/types/admission/AdmissionSettings";

export async function saveAdmissionSettings(
  payload: AdmissionSettingsPayload,
): Promise<SaveAdmissionSettingsResult> {
  const res = await fetch("/api/admission-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));

  const result: SaveAdmissionSettingsResult = res.ok
    ? { ok: true, settings: data }
    : { ok: false, error: data.error ?? "Gagal menyimpan Pengaturan PMB." };
  return result;
}
