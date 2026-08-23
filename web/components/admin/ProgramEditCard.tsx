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
import { ProgramFormDialog } from "@/components/admin/ProgramFormDialog";
import { useToast } from "@/hooks/useToast";
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
      toast.success("Program dihapus");
    } else {
      toast.error("Gagal menghapus program", "Coba lagi.");
    }
  }

  return (
    <>
      {/*
        Tombol aksi hanya muncul saat kartu disentuh pointer,
        supaya daftar terlihat tenang dan isinya yang menonjol.
        Di layar sentuh tombol selalu tampil.
      */}
      <div className="group relative flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-xl">
            {item.emoji}
          </span>

          <h3 className="min-w-0 flex-1 pt-1.5 text-[15px] leading-snug font-semibold wrap-break-word text-gray-900">
            {item.title}
          </h3>
        </div>

        <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed wrap-break-word text-gray-500">
          {item.description}
        </p>

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
            aria-label={`Hapus program ${item.title}`}
            className="h-7 w-7 text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
              Yakin mau hapus <span className="font-semibold">{item.title}</span>
              ? Tindakan ini tidak bisa dibatalkan.
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
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
