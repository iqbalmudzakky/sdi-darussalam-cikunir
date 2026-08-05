"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FacilityEditCard } from "@/components/admin/FacilityEditCard";
import { FacilityFormDialog } from "@/components/admin/FacilityFormDialog";
import {
  listFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from "@/lib/api/facilities";
import type { FacilityItem } from "@/types/Facility";

const BLANK_FACILITY = { emoji: "", title: "", subtitle: "" };

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fasilitas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit, tambah, atau hapus fasilitas sekolah.
          </p>
        </div>
        <Button
          type="button"
          variant="gradient"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 font-semibold"
        >
          <Plus />
          Tambah Fasilitas
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Gagal memuat data fasilitas. Coba refresh halaman.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
