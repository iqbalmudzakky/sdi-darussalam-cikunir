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
} from "@/components/ui/dialog";
import { ProgramFormDialog } from "@/components/admin/ProgramFormDialog";
import type { ProgramItem } from "@/types/Program";

type ProgramEditCardProps = {
  item: ProgramItem;
  onSave: (updated: ProgramItem) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

export function ProgramEditCard({
  item,
  onSave,
  onDelete,
}: ProgramEditCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const success = await onDelete(item.id);
    setIsDeleting(false);
    if (success) setIsConfirmingDelete(false);
  }

  return (
    <>
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg h-full flex flex-col p-8">
        <div className="w-16 h-16 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 shrink-0">
          <span className="text-3xl">{item.emoji}</span>
        </div>

        <div className="space-y-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
          <p className="text-gray-600 leading-relaxed flex-1">
            {item.description}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditOpen(true)}
              className="flex-1 rounded-xl"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setIsConfirmingDelete(true)}
              aria-label="Hapus program"
              className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ProgramFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Program"
        initialValue={item}
        onSubmit={(value) => onSave({ ...value, id: item.id })}
      />

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Program</DialogTitle>
            <DialogDescription>
              Yakin mau hapus{" "}
              <span className="font-semibold">{item.title}</span>? Tindakan ini
              tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
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
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
