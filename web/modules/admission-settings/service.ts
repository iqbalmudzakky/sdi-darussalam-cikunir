import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
import type { AdmissionSettingsResponse } from "./dto";
import type {
  AdmissionSettingsRow,
  SaveAdmissionSettingsInput,
} from "./entity";

export async function getSettings(): Promise<AdmissionSettingsRow> {
  const settings = await withDbLogging("admissionSettings.get", () =>
    repository.get(),
  );
  if (!settings) {
    throw new Error(
      "admission_settings row is missing — run the admission_settings migration.",
    );
  }
  return settings;
}

export async function getSettingsView(): Promise<AdmissionSettingsResponse> {
  const settings = await getSettings();
  const rupiah = new Intl.NumberFormat("id-ID");
  const tahfizhTotal = settings.tahfizh_yearly_fee + settings.tahfizh_july_fee;
  const unggulanTotal =
    settings.unggulan_yearly_fee + settings.unggulan_july_fee;

  const view: AdmissionSettingsResponse = {
    ...settings,
    tahfizh_total_label: `Rp ${rupiah.format(tahfizhTotal)}`,
    unggulan_total_label: `Rp ${rupiah.format(unggulanTotal)}`,
  };
  return view;
}

export async function saveSettings(
  input: SaveAdmissionSettingsInput,
): Promise<AdmissionSettingsResponse> {
  await withDbLogging("admissionSettings.update", () =>
    repository.update(input),
  );
  return getSettingsView();
}

export async function getContactPhone(): Promise<string> {
  const settings = await getSettings();
  return settings.pmb_contact_phone;
}
