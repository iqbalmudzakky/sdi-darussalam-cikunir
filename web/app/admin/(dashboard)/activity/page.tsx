"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityEditCard } from "@/components/admin/ActivityEditCard";
import { ActivityFormDialog } from "@/components/admin/ActivityFormDialog";
import {
  listActivities,
  createActivity,
  updateActivity,
  deleteActivity,
} from "@/lib/api/activities";
import type { ActivityItem } from "@/types/Activity";

const BLANK_ACTIVITY: Omit<ActivityItem, "id"> = {
  emoji: "",
  title: "",
  description: "",
  badge: "",
  photo_url: null,
};

export default function AdminActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      const data = await listActivities();
      setItems(data);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(value: typeof BLANK_ACTIVITY): Promise<boolean> {
    try {
      const saved = await createActivity(value);
      setItems((prev) => [...prev, saved]);
      return true;
    } catch (error) {
      console.error("Failed to create activity:", error);
      return false;
    }
  }

  async function handleSave(updated: ActivityItem): Promise<boolean> {
    const payload = {
      title: updated.title,
      description: updated.description,
      emoji: updated.emoji,
      badge: updated.badge,
      photo_url: updated.photo_url,
    };

    try {
      const saved = await updateActivity(updated.id, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? saved : item)),
      );
      return true;
    } catch (error) {
      console.error("Failed to save activity:", error);
      return false;
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    try {
      await deleteActivity(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete activity:", error);
      return false;
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kegiatan</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit, tambah, atau hapus kegiatan/ekstrakurikuler.
          </p>
        </div>
        <Button
          type="button"
          variant="gradient"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 font-semibold"
        >
          <Plus />
          Tambah Kegiatan
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Gagal memuat data kegiatan. Coba refresh halaman.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div key={item.id} className="h-full">
              <ActivityEditCard
                item={item}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <ActivityFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Kegiatan"
        initialValue={BLANK_ACTIVITY}
        onSubmit={handleAdd}
      />
    </div>
  );
}
