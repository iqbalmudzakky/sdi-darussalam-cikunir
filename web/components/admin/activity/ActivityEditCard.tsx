"use client";

import { useState } from "react";
import { Pencil, Trash2, Play } from "lucide-react";
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
      <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-gray-300">
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-gray-100">
          {previewImageUrl ? (
            <img
              src={previewImageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-5xl">{item.emoji}</span>
          )}

          {/*
            Penanda bahwa isi kartu ini video, bukan foto.
            Membantu membedakan sekilas di daftar campuran.
          */}
          {videoId && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-gray-900/75 px-2 py-1 text-[11px] font-medium text-white">
              <Play className="h-3 w-3 fill-current" />
              Video
            </span>
          )}

          {item.badge && (
            <span className="absolute top-2 right-2 rounded-md bg-brand-600 px-2 py-1 text-[11px] font-semibold text-white">
              {item.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-[15px] leading-snug font-semibold wrap-break-word text-gray-900">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-1.5 line-clamp-3 flex-1 text-sm leading-relaxed wrap-break-word text-gray-500">
              {item.description}
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
              aria-label={`Hapus kegiatan ${item.title}`}
              className="h-7 w-7 text-gray-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
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
