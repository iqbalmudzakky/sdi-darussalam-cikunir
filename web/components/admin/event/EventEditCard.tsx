"use client";

import { useState } from "react";
import { ImageIcon, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EventFormDialog } from "./EventFormDialog";
import { useToast } from "@/hooks/useToast";
import { parseDateOnly, formatDate } from "@/lib/date";
import type { EventItem } from "@/types/Event";

type EventEditCardProps = {
  item: EventItem;
  categorySuggestions: string[];
  onSave: (
    updated: EventItem,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDelete: (
    id: string,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function EventEditCard({
  item,
  categorySuggestions,
  onSave,
  onDelete,
}: EventEditCardProps) {
  const toast = useToast();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      const result = await onDelete(item.id);

      if (result.ok) {
        setIsConfirmingDelete(false);
        toast.success("Event dihapus");
      } else {
        toast.error("Gagal menghapus event", result.error);
      }
    } catch (error) {
      console.error("handleConfirmDelete failed:", error);
      toast.error("Gagal menghapus event", "Terjadi kesalahan tak terduga.");
    } finally {
      setIsDeleting(false);
    }
  }

  const eventDate = parseDateOnly(item.event_date);

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300">
        <div className="relative aspect-3/4 w-full overflow-hidden bg-gray-100">
          {item.poster_url ? (
            <img
              src={item.poster_url}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-gray-300" />
            </div>
          )}

          {!item.is_published && (
            <span className="absolute top-2 left-2 rounded-md bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white">
              Draf
            </span>
          )}

          {item.category && (
            <span className="absolute top-2 right-2 rounded-md bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white">
              {item.category}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-medium text-gray-400">
            {eventDate ? formatDate(eventDate) : item.event_date}
          </p>
          <h3 className="mt-1 text-[15px] leading-snug font-semibold wrap-break-word text-gray-900">
            {item.title}
          </h3>

          {item.summary && (
            <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed wrap-break-word text-gray-500">
              {item.summary}
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
              aria-label={`Hapus event ${item.title}`}
              className="h-7 w-7 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <EventFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Event"
        initialValue={item}
        categorySuggestions={categorySuggestions}
        onSubmit={(value) => onSave({ ...value, id: item.id, slug: item.slug })}
      />

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Event</DialogTitle>
            <DialogDescription>
              Yakin mau hapus{" "}
              <span className="font-semibold">{item.title}</span>?
              {item.is_published
                ? " Tautannya sudah bisa dibuka orang lain dan akan mati setelah ini."
                : " Tindakan ini tidak bisa dibatalkan."}
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
