"use client";

import { useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { getSchoolProfileStats } from "@/lib/api/schoolProfile";
import { formatDateTime } from "@/lib/date";
import type { SchoolProfileStats } from "@/types/SchoolProfile";

const statCardClassName =
  "rounded-lg border border-gray-200 bg-gray-50 px-4 py-3";
const syncChipClassName =
  "inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600";

export function SchoolStatsSection() {
  const [stats, setStats] = useState<SchoolProfileStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getSchoolProfileStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load school profile stats:", error);
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <AdminFormSection title="Angka Sekolah" description="Dari SSO, tiap jam.">
      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : loadError || !stats ? (
        <p className="text-sm text-gray-500">Gagal memuat angka sekolah.</p>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={statCardClassName}>
              <p className="text-sm text-gray-500">Siswa aktif</p>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">
                {stats.active_student_count?.toLocaleString("id-ID") ?? "-"}
              </p>
            </div>

            <div className={statCardClassName}>
              <p className="text-sm text-gray-500">Guru &amp; staf</p>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">
                {stats.staff_count?.toLocaleString("id-ID") ?? "-"}
              </p>
            </div>
          </div>

          <span className={syncChipClassName}>
            <RefreshCw className="h-3.5 w-3.5" />
            {stats.stats_synced_at
              ? formatDateTime(stats.stats_synced_at)
              : "Belum tersinkron"}
          </span>
        </div>
      )}
    </AdminFormSection>
  );
}
