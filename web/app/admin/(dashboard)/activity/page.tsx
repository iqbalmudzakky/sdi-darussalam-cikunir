"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityEditCard } from "@/components/admin/ActivityEditCard";
import { useActivityAdminPage } from "@/hooks/useActivityAdminPage";

export default function AdminActivityPage() {
  const {
    items,
    newlyAddedId,
    newCardRef,
    handleAddNew,
    handleSave,
    handleDelete,
  } = useActivityAdminPage();

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
          onClick={handleAddNew}
          className="px-5 py-2.5 font-semibold"
        >
          <Plus />
          Tambah Kegiatan
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div
            key={item.id}
            ref={item.id === newlyAddedId ? newCardRef : undefined}
          >
            <ActivityEditCard
              item={item}
              isNew={item.id === newlyAddedId}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
