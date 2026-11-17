import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import * as adminService from "@/modules/admin/service";
import { AdminManagementView } from "@/components/admin/admin-management/AdminManagementView";

export default async function AdminManagementPage() {
  const user = await requirePermission("manage_accounts");
  if (!user) {
    redirect("/dashboard");
  }

  const roleOptions = adminService.listAssignableRoles(user.role);

  return <AdminManagementView roleOptions={roleOptions} />;
}
