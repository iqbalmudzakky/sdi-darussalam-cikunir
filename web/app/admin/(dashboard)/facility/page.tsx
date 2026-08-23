"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Building2 } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { FacilityEditCard } from "@/components/admin/facility/FacilityEditCard";
import { FacilityFormDialog } from "@/components/admin/facility/FacilityFormDialog";
import {
  listFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from "@/lib/api/facilities";
import type { FacilityItem } from "@/types/Facility";

const BLANK_FACILITY: Omit<FacilityItem, "id"> = {
  emoji: "",
  title: "",
  subtitle: "",
  photo_url: null,
};

export default function AdminFacilityPage() {
  const [items, setItems] = useState<FacilityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, []);

  async function loadFacilities() {
    try {
      const data = await listFacilities();
      setItems(data);
    } catch (error) {
      console.error("Failed to load facilities:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(value: typeof BLANK_FACILITY): Promise<boolean> {
    try {
      const saved = await createFacility(value);
      setItems((prev) => [...prev, saved]);
      return true;
    } catch (error) {
      console.error("Failed to create facility:", error);
      return false;
    }
  }

  async function handleSave(updated: FacilityItem): Promise<boolean> {
    const payload = {
      title: updated.title,
      subtitle: updated.subtitle,
      emoji: updated.emoji,
      photo_url: updated.photo_url,
    };

    try {
      const saved = await updateFacility(updated.id, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? saved : item)),
      );
      return true;
    } catch (error) {
      console.error("Failed to save facility:", error);
      return false;
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    try {
      await deleteFacility(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete facility:", error);
      return false;
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Fasilitas"
        description="Ruang dan sarana yang tampil di section Fasilitas pada halaman utama."
        count={isLoading || loadError ? undefined : items.length}
        action={
          <Button
            type="button"
            variant="gradient"
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus />
            Tambah Fasilitas
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Gagal memuat data fasilitas. Coba refresh halaman.</p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={Building2}
          title="Belum ada fasilitas"
          description="Fasilitas yang ditambahkan di sini akan tampil di section Fasilitas pada halaman utama."
          action={
            <Button
              type="button"
              variant="gradient"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus />
              Tambah Fasilitas
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="h-full">
              <FacilityEditCard
                item={item}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <FacilityFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Fasilitas"
        initialValue={BLANK_FACILITY}
        onSubmit={handleAdd}
      />
    </div>
  );
}
