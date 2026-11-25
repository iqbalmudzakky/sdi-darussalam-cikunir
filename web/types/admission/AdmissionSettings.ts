import type {
  AdmissionSettingsResponse,
  SaveAdmissionSettingsRequest,
} from "@/modules/admission-settings/dto";

export type AdmissionSettings = AdmissionSettingsResponse;

export type AdmissionSettingsPayload = SaveAdmissionSettingsRequest;

export type SaveAdmissionSettingsResult =
  { ok: true; settings: AdmissionSettings } | { ok: false; error: string };
