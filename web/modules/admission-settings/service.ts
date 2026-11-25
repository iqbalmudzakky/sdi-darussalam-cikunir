import { withDbLogging } from "@/modules/db/errors";
import * as repository from "./repository";
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

export async function saveSettings(
  input: SaveAdmissionSettingsInput,
): Promise<AdmissionSettingsRow> {
  await withDbLogging("admissionSettings.update", () =>
    repository.update(input),
  );
  return getSettings();
}

export async function getContactPhone(): Promise<string> {
  const settings = await getSettings();
  return settings.pmb_contact_phone;
}
