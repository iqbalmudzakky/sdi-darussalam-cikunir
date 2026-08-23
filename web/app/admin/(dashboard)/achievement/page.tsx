"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prestasi</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit, tambah, atau hapus prestasi yang ditampilkan di halaman utama.
          </p>
        </div>
        <Button
          type="button"
          variant="gradient"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 font-semibold"
        >
          <Plus />
          Tambah Prestasi
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Gagal memuat data prestasi. Coba refresh halaman.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
