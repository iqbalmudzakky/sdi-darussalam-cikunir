"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FacilityFormDialog } from "@/components/admin/FacilityFormDialog";
import { useToast } from "@/hooks/useToast";
import type { FacilityItem } from "@/types/Facility";

type FacilityEditCardProps = {
  item: FacilityItem;
  onSave: (updated: FacilityItem) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

export function FacilityEditCard({
  item,
  onSave,
  onDelete,
}: FacilityEditCardProps) {
  const toast = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const success = await onDelete(item.id);
    setIsDeleting(false);
    if (success) {
      setIsConfirmingDelete(false);
      toast.success("Fasilitas dihapus");
    } else {
      toast.error("Gagal menghapus fasilitas", "Coba lagi.");
    }
  }

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300">
        {/*
          Pratinjau memakai rasio yang sama dengan kartu di
          halaman utama, supaya admin melihat bagian foto
          yang benar-benar akan tampil.
        */}
        <div className="relative flex aspect-4/3 w-full items-center justify-center overflow-hidden bg-gray-100">
          {item.photo_url ? (
            <img
              src={item.photo_url}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-4xl">{item.emoji}</span>
          )}

          {!item.photo_url && (
            <span className="absolute right-2 bottom-2 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
              Belum ada foto
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-[15px] leading-snug font-semibold wrap-break-word text-gray-900">
            {item.title}
          </h3>

          {item.subtitle && (
            <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed wrap-break-word text-gray-500">
              {item.subtitle}
            </p>
          )}

          <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="flex-1"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>

            <Button
              type="button"
              size="icon-sm"
              variant="outline"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label={`Hapus fasilitas ${item.title}`}
              className="h-7 w-7 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <FacilityFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Fasilitas"
        initialValue={item}
        onSubmit={(value) => onSave({ ...value, id: item.id })}
      />

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Fasilitas</DialogTitle>
            <DialogDescription>
              Yakin mau hapus{" "}
              <span className="font-semibold">{item.title}</span>? Tindakan ini
              tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
