import { notFound } from "next/navigation";
import { AdmissionSettingsView } from "@/components/admin/admission-settings/AdmissionSettingsView";
import { getAdmissionSettings } from "@/lib/actions/admissionSettings";

export default async function AdmissionSettingsPage() {
  const settings = await getAdmissionSettings();
  if (!settings) notFound();

  return <AdmissionSettingsView initial={settings} />;
}
