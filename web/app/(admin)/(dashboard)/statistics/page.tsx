import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SchoolStatsSection } from "@/components/admin/statistics/SchoolStatsSection";
import { RegistrationStatsSection } from "@/components/admin/statistics/RegistrationStatsSection";

export default function AdminStatisticsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Statistik"
        description="Angka yang tampil sebagai statistik di halaman depan: siswa aktif, guru & staf, dan jumlah pendaftar."
      />

      <div className="space-y-6">
        <SchoolStatsSection />
        <RegistrationStatsSection />
      </div>
    </div>
  );
}
