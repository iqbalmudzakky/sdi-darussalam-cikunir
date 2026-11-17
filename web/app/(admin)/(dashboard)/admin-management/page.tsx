import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import { AdminManagementView } from "@/components/admin/admin-management/AdminManagementView";

export default async function AdminManagementPage() {
  const user = await requirePermission("view_accounts");
  if (!user) {
    redirect("/dashboard");
  }

  return <AdminManagementView />;
}
