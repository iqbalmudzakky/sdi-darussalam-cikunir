"use client";

import { useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import { Briefcase, Loader2, RefreshCw, Users } from "lucide-react";
import { AdminFormSection } from "@/components/admin/shared/AdminFormSection";
import { getSchoolProfileStats } from "@/lib/api/content/schoolProfile";
import type { SchoolProfileStats } from "@/types/content/SchoolProfile";

const statCardClassName =
  "flex items-center gap-3 rounded-[10px] border border-gray-200 bg-white p-3.5";
const statIconClassName =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-50 text-brand-600";
const statValueClassName =
  "text-[28px] leading-[34px] font-semibold text-gray-900 tabular-nums";

const syncChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border py-1 pr-2.5 pl-2 text-xs font-semibold",
  {
    variants: {
      synced: {
        true: "border-brand-200 bg-brand-50 text-brand-700",
        false: "border-gray-200 bg-gray-100 text-gray-600",
      },
    },
  },
);

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

  const syncChip = stats && (
    <span className={syncChipVariants({ synced: !!stats.stats_synced_at })}>
      <RefreshCw className="h-3.5 w-3.5" />
      {stats.stats_synced_at
        ? new Date(stats.stats_synced_at).toLocaleString("id-ID", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "Belum tersinkron"}
    </span>
  );

  return (
    <AdminFormSection title="Siswa & Guru" action={syncChip}>
      {isLoading ? (
        <div className="flex items-center justify-center py-6 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : loadError || !stats ? (
        <p className="text-sm text-gray-500">Gagal memuat angka sekolah.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className={statCardClassName}>
            <span className={statIconClassName}>
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className={statValueClassName}>
                {stats.active_student_count?.toLocaleString("id-ID") ?? "-"}
              </p>
              <p className="text-[13px] text-gray-500">Siswa aktif</p>
            </div>
          </div>

          <div className={statCardClassName}>
            <span className={statIconClassName}>
              <Briefcase className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className={statValueClassName}>
                {stats.staff_count?.toLocaleString("id-ID") ?? "-"}
              </p>
              <p className="text-[13px] text-gray-500">Guru &amp; staf</p>
            </div>
          </div>
        </div>
      )}
    </AdminFormSection>
  );
}
