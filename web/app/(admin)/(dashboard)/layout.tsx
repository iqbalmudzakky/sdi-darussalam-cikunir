import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { ROLE_PERMISSIONS } from "@/modules/shared/constant/role";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { SessionRefresher } from "@/components/admin/layout/SessionRefresher";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    notFound();
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SessionRefresher />
      <AdminSidebar
        role={user.role}
        permissions={ROLE_PERMISSIONS[user.role]}
      />
      <main className="min-w-0 flex-1 px-4 pt-20 pb-12 sm:px-6 lg:px-10 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
