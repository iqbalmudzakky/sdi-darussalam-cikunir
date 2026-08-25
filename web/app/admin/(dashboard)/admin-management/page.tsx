import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth/session";
import { AdminManagementView } from "@/components/admin/admin-management/AdminManagementView";

export default async function AdminManagementPage() {
  const user = await requireSuperadmin();
  if (!user) {
    redirect("/admin");
  }

  return <AdminManagementView currentUserId={user.id} />;
}
