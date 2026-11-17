import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth/session";
import * as adminService from "@/modules/admin/service";
import { hasPermission } from "@/modules/auth/service";
import { AdminManagementView } from "@/components/admin/admin-management/AdminManagementView";

export default async function AdminManagementPage() {
  const user = await requirePermission("view_accounts");
  if (!user) {
    redirect("/dashboard");
  }

  const roleOptions = adminService.listAssignableRoles(user.role);
  const canManage = hasPermission(user.role, "manage_accounts");

  return (
    <AdminManagementView roleOptions={roleOptions} canManage={canManage} />
  );
}
