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
import { ActivityFormDialog } from "./ActivityFormDialog";
import { useToast } from "@/hooks/useToast";
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
} from "@/lib/social/youtube";
import type { ActivityItem } from "@/types/Activity";

type ActivityEditCardProps = {
  item: ActivityItem;
  onSave: (updated: ActivityItem) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

export function ActivityEditCard({
  item,
  onSave,
  onDelete,
}: ActivityEditCardProps) {
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
      toast.success("Kegiatan dihapus");
    } else {
      toast.error("Gagal menghapus kegiatan", "Coba lagi.");
    }
  }

  const videoId = item.youtube_url
    ? extractYouTubeVideoId(item.youtube_url)
    : null;
  const previewImageUrl = videoId
    ? getYouTubeThumbnailUrl(videoId)
    : item.photo_url;

  return (
    <>
      <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg h-full flex flex-col">
        <div className="relative aspect-video w-full bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center overflow-hidden">
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl">{item.emoji}</span>
          )}
        </div>

        <div className="p-6 space-y-4 flex-1 flex flex-col">
          <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
          <p className="text-gray-600 flex-1">{item.description}</p>
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
              aria-label="Hapus kegiatan"
              className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {item.badge && (
          <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {item.badge}
          </div>
        )}
      </div>

      <ActivityFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Kegiatan"
        initialValue={item}
        onSubmit={(value) => onSave({ ...value, id: item.id })}
      />

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Kegiatan</DialogTitle>
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
