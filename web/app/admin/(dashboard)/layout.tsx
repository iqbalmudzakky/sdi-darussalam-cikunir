import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SessionRefresher } from "@/components/admin/SessionRefresher";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SessionRefresher />
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-10">{children}</main>
    </div>
  );
}
