import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { PaymentSettingsView } from "@/components/admin/payment/PaymentSettingsView";

export default async function AdminPaymentPage() {
  const user = await requirePermission("view_admission_settings");
  if (!user) {
    redirect("/dashboard");
  }

  return <PaymentSettingsView />;
}
