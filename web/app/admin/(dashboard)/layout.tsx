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
      {/*
        pt-14 memberi ruang untuk bilah atas yang hanya
        tampil di layar kecil; mulai lg bilah itu hilang
        dan paddingnya ikut dilepas.
      */}
      <main className="min-w-0 flex-1 px-4 pt-20 pb-10 sm:px-6 lg:px-10 lg:pt-10">
        {children}
      </main>
    </div>
  );
}
