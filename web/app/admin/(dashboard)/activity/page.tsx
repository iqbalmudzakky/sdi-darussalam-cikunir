"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, CalendarDays } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
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
  youtube_url: null,
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
      youtube_url: updated.youtube_url,
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
      <AdminPageHeader
        title="Kegiatan"
        description="Kegiatan dan ekstrakurikuler yang tampil di section Kegiatan pada halaman utama."
        count={isLoading || loadError ? undefined : items.length}
        action={
          <Button
            type="button"
            variant="gradient"
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus />
            Tambah Kegiatan
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Gagal memuat data kegiatan. Coba refresh halaman.</p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={CalendarDays}
          title="Belum ada kegiatan"
          description="Kegiatan dan ekstrakurikuler yang ditambahkan di sini akan tampil di section Kegiatan pada halaman utama."
          action={
            <Button
              type="button"
              variant="gradient"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus />
              Tambah Kegiatan
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
