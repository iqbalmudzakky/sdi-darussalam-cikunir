import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { hasPermission } from "@/modules/auth/service";
import { PaymentSettingsView } from "@/components/admin/payment/PaymentSettingsView";

export default async function AdminPaymentPage() {
  const user = await requirePermission("view_admission_settings");
  if (!user) {
    redirect("/dashboard");
  }

  const canManage = hasPermission(user.role, "manage_admission_settings");

  return <PaymentSettingsView canManage={canManage} />;
}
