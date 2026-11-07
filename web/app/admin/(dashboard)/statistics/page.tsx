"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminFormSection } from "@/components/admin/AdminFormSection";
import { useToast } from "@/hooks/useToast";
import {
  getSchoolProfileStats,
  saveSchoolProfileStats,
} from "@/lib/api/schoolProfile";
import {
  getAcademicYears,
  addAcademicYear,
  saveOfflineCount,
  setCurrentAcademicYear,
} from "@/lib/api/registrationStats";
import type { AcademicYearSummary } from "@/types/RegistrationStats";

function formatCount(value: number): string {
  return value.toLocaleString("id-ID");
}

function isValidOptionalCount(value: string): boolean {
  if (value.trim() === "") return true;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0;
}

export default function AdminStatisticsPage() {
  const toast = useToast();

  // Bagian 1 — angka sekolah
  const [activeStudentInput, setActiveStudentInput] = useState("");
  const [staffInput, setStaffInput] = useState("");
  const [isLoadingSchoolStats, setIsLoadingSchoolStats] = useState(true);
  const [schoolStatsLoadError, setSchoolStatsLoadError] = useState(false);
  const [isSavingSchoolStats, setIsSavingSchoolStats] = useState(false);

  // Bagian 2 — pendaftar
  const [years, setYears] = useState<AcademicYearSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [offlineDraft, setOfflineDraft] = useState("0");
  const [newYearInput, setNewYearInput] = useState("");
  const [isLoadingYears, setIsLoadingYears] = useState(true);
  const [yearsLoadError, setYearsLoadError] = useState(false);
  const [isSavingOfflineCount, setIsSavingOfflineCount] = useState(false);
  const [isSettingCurrent, setIsSettingCurrent] = useState(false);
  const [isAddingYear, setIsAddingYear] = useState(false);

  useEffect(() => {
    loadSchoolStats();
    loadAcademicYears();
  }, []);

  async function loadSchoolStats() {
    try {
      const stats = await getSchoolProfileStats();
      setActiveStudentInput(
        stats.active_student_count === null
          ? ""
          : String(stats.active_student_count),
      );
      setStaffInput(
        stats.staff_count === null ? "" : String(stats.staff_count),
      );
    } catch (error) {
      console.error("Failed to load school profile stats:", error);
      setSchoolStatsLoadError(true);
    } finally {
      setIsLoadingSchoolStats(false);
    }
  }

  async function loadAcademicYears() {
    try {
      const data = await getAcademicYears();
      setYears(data);

      const current = data.find((year) => year.is_current) ?? data[0];
      if (current) {
        setSelectedYear(current.academic_year);
        setOfflineDraft(String(current.offline_pending_count));
      }
    } catch (error) {
      console.error("Failed to load registration stats:", error);
      setYearsLoadError(true);
    } finally {
      setIsLoadingYears(false);
    }
  }

  function handleSelectYear(academicYear: string) {
    setSelectedYear(academicYear);
    const year = years.find((y) => y.academic_year === academicYear);
    setOfflineDraft(String(year?.offline_pending_count ?? 0));
  }

  async function handleSaveSchoolStats() {
    if (!isValidOptionalCount(activeStudentInput)) {
      toast.error(
        "Jumlah siswa tidak valid",
        "Isi dengan bilangan bulat 0 atau lebih, atau kosongkan.",
      );
      return;
    }
    if (!isValidOptionalCount(staffInput)) {
      toast.error(
        "Jumlah guru & staf tidak valid",
        "Isi dengan bilangan bulat 0 atau lebih, atau kosongkan.",
      );
      return;
    }

    setIsSavingSchoolStats(true);
    try {
      const input = {
        active_student_count:
          activeStudentInput.trim() === "" ? null : Number(activeStudentInput),
        staff_count: staffInput.trim() === "" ? null : Number(staffInput),
      };
      const result = await saveSchoolProfileStats(input);

      if (!result.ok) {
        toast.error("Gagal menyimpan", result.error);
        return;
      }

      toast.success(
        "Tersimpan",
        "Angka sekolah langsung tampil di halaman depan.",
      );
    } catch (error) {
      console.error("handleSaveSchoolStats failed:", error);
      toast.error("Gagal menyimpan", "Terjadi kesalahan tak terduga.");
    } finally {
      setIsSavingSchoolStats(false);
    }
  }

  async function handleSaveOfflineCount() {
    const parsed = Number(offlineDraft);
    if (!Number.isInteger(parsed) || parsed < 0) {
      toast.error(
        "Jumlah tidak valid",
        "Isi dengan bilangan bulat 0 atau lebih.",
      );
      return;
    }

    setIsSavingOfflineCount(true);
    try {
      const result = await saveOfflineCount(selectedYear, parsed);

      if (!result.ok) {
        toast.error("Gagal menyimpan", result.error);
        return;
      }

      setYears((prev) =>
        prev.map((year) =>
          year.academic_year === result.data.academic_year ? result.data : year,
        ),
      );
      toast.success("Tersimpan", "Jumlah pendaftar offline diperbarui.");
    } catch (error) {
      console.error("handleSaveOfflineCount failed:", error);
      toast.error("Gagal menyimpan", "Terjadi kesalahan tak terduga.");
    } finally {
      setIsSavingOfflineCount(false);
    }
  }

  async function handleSetCurrentYear() {
    setIsSettingCurrent(true);
    try {
      const result = await setCurrentAcademicYear(selectedYear);

      if (!result.ok) {
        toast.error("Gagal mengubah tahun aktif", result.error);
        return;
      }

      setYears((prev) =>
        prev.map((year) => ({
          ...year,
          is_current: year.academic_year === result.data.academic_year,
        })),
      );
      toast.success("Tersimpan", `Tahun ajaran ${selectedYear} kini aktif.`);
    } catch (error) {
      console.error("handleSetCurrentYear failed:", error);
      toast.error(
        "Gagal mengubah tahun aktif",
        "Terjadi kesalahan tak terduga.",
      );
    } finally {
      setIsSettingCurrent(false);
    }
  }

  async function handleAddYear() {
    const trimmed = newYearInput.trim();
    if (!trimmed) return;

    setIsAddingYear(true);
    try {
      const result = await addAcademicYear(trimmed);

      if (!result.ok) {
        toast.error("Gagal menambah tahun ajaran", result.error);
        return;
      }

      setYears((prev) => [...prev, result.data]);
      setSelectedYear(result.data.academic_year);
      setOfflineDraft(String(result.data.offline_pending_count));
      setNewYearInput("");
      toast.success(
        "Tersimpan",
        `Tahun ajaran ${result.data.academic_year} ditambahkan.`,
      );
    } catch (error) {
      console.error("handleAddYear failed:", error);
      toast.error(
        "Gagal menambah tahun ajaran",
        "Terjadi kesalahan tak terduga.",
      );
    } finally {
      setIsAddingYear(false);
    }
  }

  const selectedYearData =
    years.find((year) => year.academic_year === selectedYear) ?? null;
  const parsedOfflineDraft = Number(offlineDraft);
  const isValidOfflineDraft =
    Number.isInteger(parsedOfflineDraft) && parsedOfflineDraft >= 0;
  const liveTotal =
    selectedYearData && isValidOfflineDraft
      ? selectedYearData.online_count +
        selectedYearData.offline_recorded_count +
        parsedOfflineDraft
      : null;

  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        title="Statistik"
        description="Angka yang tampil sebagai statistik di halaman depan: siswa aktif, guru & staf, dan jumlah pendaftar."
      />

      <div className="space-y-6">
        <AdminFormSection
          title="Angka Sekolah"
          description="Ditampilkan di deretan angka pada bagian atas halaman depan."
        >
          {isLoadingSchoolStats ? (
            <div className="flex items-center justify-center py-6 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : schoolStatsLoadError ? (
            <p className="text-sm text-gray-500">
              Gagal memuat angka sekolah. Muat ulang halaman untuk mencoba lagi.
            </p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="active-student-count">Siswa aktif</Label>
                  <Input
                    id="active-student-count"
                    inputMode="numeric"
                    value={activeStudentInput}
                    onChange={(e) =>
                      setActiveStudentInput(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="mis. 690"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="staff-count">Guru &amp; staf</Label>
                  <Input
                    id="staff-count"
                    inputMode="numeric"
                    value={staffInput}
                    onChange={(e) =>
                      setStaffInput(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="mis. 65"
                  />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Angka ini tampil di halaman depan. Kosongkan kolom untuk
                menyembunyikannya dari sana.
              </p>

              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSaveSchoolStats}
                  disabled={isSavingSchoolStats}
                >
                  {isSavingSchoolStats ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isSavingSchoolStats ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </>
          )}
        </AdminFormSection>

        <AdminFormSection
          title="Pendaftar"
          description="Total pendaftar yang tampil di halaman depan dihitung per tahun ajaran."
        >
          {isLoadingYears ? (
            <div className="flex items-center justify-center py-6 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : yearsLoadError ? (
            <p className="text-sm text-gray-500">
              Gagal memuat data pendaftar. Muat ulang halaman untuk mencoba
              lagi.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-40 space-y-2">
                  <Label htmlFor="academic-year-select">Tahun ajaran</Label>
                  <Select
                    items={years.map((year) => ({
                      value: year.academic_year,
                      label: year.academic_year,
                    }))}
                    value={selectedYear || null}
                    onValueChange={(value) => value && handleSelectYear(value)}
                  >
                    <SelectTrigger id="academic-year-select" className="h-9">
                      <SelectValue placeholder="Pilih tahun ajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem
                          key={year.academic_year}
                          value={year.academic_year}
                        >
                          {year.academic_year}
                          {year.is_current ? " (aktif)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedYearData && !selectedYearData.is_current && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSetCurrentYear}
                    disabled={isSettingCurrent}
                  >
                    {isSettingCurrent && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Tandai sebagai tahun aktif
                  </Button>
                )}
              </div>

              {selectedYearData?.is_current && (
                <p className="text-sm font-medium text-brand-700">
                  Tahun ajaran ini yang tampil di halaman depan.
                </p>
              )}

              <div className="flex flex-wrap items-end gap-2">
                <div className="space-y-2">
                  <Label htmlFor="new-academic-year">Tambah tahun ajaran</Label>
                  <Input
                    id="new-academic-year"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    placeholder="2028/2029"
                    className="max-w-40"
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddYear}
                  disabled={isAddingYear || !newYearInput.trim()}
                >
                  {isAddingYear ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Tambah
                </Button>
              </div>

              {selectedYearData && (
                <div className="space-y-4 border-t border-gray-100 pt-4">
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-500">Pendaftar online</dt>
                      <dd className="font-medium text-gray-900 tabular-nums">
                        {formatCount(selectedYearData.online_count)}
                      </dd>
                    </div>

                    <div className="flex items-center justify-between">
                      <dt className="text-gray-500">
                        Pendaftar offline sudah diinput
                      </dt>
                      <dd className="font-medium text-gray-900 tabular-nums">
                        {formatCount(selectedYearData.offline_recorded_count)}
                      </dd>
                    </div>
                  </dl>

                  <div className="space-y-2">
                    <Label htmlFor="offline-pending-count">
                      Pendaftar offline yang belum diinput ke sistem
                    </Label>
                    <Input
                      id="offline-pending-count"
                      inputMode="numeric"
                      value={offlineDraft}
                      onChange={(e) =>
                        setOfflineDraft(e.target.value.replace(/\D/g, ""))
                      }
                      className="max-w-40"
                    />
                    <p className="text-sm text-gray-500">
                      Sudah ada{" "}
                      {formatCount(selectedYearData.offline_recorded_count)}{" "}
                      pendaftar offline yang diinput lewat form. Jangan dihitung
                      lagi di sini.
                    </p>
                  </div>

                  <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">
                      Total tampil di website
                    </span>
                    <span className="text-lg font-semibold text-gray-900 tabular-nums">
                      {liveTotal === null ? "—" : formatCount(liveTotal)}
                    </span>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleSaveOfflineCount}
                      disabled={isSavingOfflineCount || !isValidOfflineDraft}
                    >
                      {isSavingOfflineCount ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {isSavingOfflineCount ? "Menyimpan..." : "Simpan"}
                    </Button>
                  </div>
                </div>
              )}

              {!selectedYearData && (
                <p className="text-sm text-gray-500">
                  Belum ada tahun ajaran. Tambahkan satu di atas.
                </p>
              )}
            </>
          )}
        </AdminFormSection>
      </div>
    </div>
  );
}
