"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trophy } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { AchievementEditCard } from "@/components/admin/achievement/AchievementEditCard";
import { AchievementFormDialog } from "@/components/admin/achievement/AchievementFormDialog";
import {
  listAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from "@/lib/api/achievements";
import type { AchievementItem } from "@/types/Achievement";

const BLANK_ACHIEVEMENT = { emoji: "", title: "", description: "" };

export default function AdminAchievementPage() {
  const [items, setItems] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    loadAchievements();
  }, []);

  async function loadAchievements() {
    try {
      const data = await listAchievements();
      setItems(data);
    } catch (error) {
      console.error("Failed to load achievements:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(value: typeof BLANK_ACHIEVEMENT): Promise<boolean> {
    try {
      const saved = await createAchievement(value);
      setItems((prev) => [...prev, saved]);
      return true;
    } catch (error) {
      console.error("Failed to create achievement:", error);
      return false;
    }
  }

  async function handleSave(updated: AchievementItem): Promise<boolean> {
    const payload = {
      title: updated.title,
      description: updated.description,
      emoji: updated.emoji,
    };

    try {
      const saved = await updateAchievement(updated.id, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? saved : item)),
      );
      return true;
    } catch (error) {
      console.error("Failed to save achievement:", error);
      return false;
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    try {
      await deleteAchievement(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete achievement:", error);
      return false;
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Prestasi"
        description="Prestasi yang tampil di bagian Prestasi Kami pada halaman utama."
        count={isLoading || loadError ? undefined : items.length}
        action={
          <Button
            type="button"
            variant="gradient"
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus />
            Tambah Prestasi
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Gagal memuat data prestasi. Coba refresh halaman.</p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={Trophy}
          title="Belum ada prestasi"
          description="Prestasi yang ditambahkan di sini akan tampil di bagian Prestasi Kami pada halaman utama."
          action={
            <Button
              type="button"
              variant="gradient"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus />
              Tambah Prestasi
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="h-full">
              <AchievementEditCard
                item={item}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <AchievementFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Prestasi"
        initialValue={BLANK_ACHIEVEMENT}
        onSubmit={handleAdd}
      />
    </div>
  );
}
