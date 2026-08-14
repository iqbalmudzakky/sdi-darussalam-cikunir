"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { prepareImageForUpload } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { EmojiPicker } from "@/components/admin/EmojiPicker";
import { useToast } from "@/hooks/useToast";
import type { ActivityItem } from "@/types/Activity";

type ActivityFormValue = Omit<ActivityItem, "id">;

type ActivityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: ActivityFormValue;
  onSubmit: (value: ActivityFormValue) => Promise<boolean>;
};

export function ActivityFormDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  onSubmit,
}: ActivityFormDialogProps) {
  const toast = useToast();
  const [draft, setDraft] = useState(initialValue);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotoFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initialValue);
      setTitleError(false);
      pendingPhotoFileRef.current = null;
    }
  }, [open]);

  function updateDraft(patch: Partial<ActivityFormValue>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
  }

  async function applyPhotoFile(file: File) {
    setIsPreparingPhoto(true);

    try {
      const preparedFile = await prepareImageForUpload(file);

      pendingPhotoFileRef.current = preparedFile;
      updateDraft({ photo_url: URL.createObjectURL(preparedFile) });
    } catch (error) {
      console.error("Failed to prepare activity photo:", error);
      toast.error("Gagal memproses foto", "Coba pilih foto lain.");
    } finally {
      setIsPreparingPhoto(false);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    void applyPhotoFile(file);
    e.target.value = "";
  }

  function handlePhotoDragOver(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();

    if (isUploading || isPreparingPhoto) return;

    e.dataTransfer.dropEffect = "copy";
    setIsDraggingPhoto(true);
  }

  function handlePhotoDragLeave() {
    setIsDraggingPhoto(false);
  }

  function handlePhotoDrop(e: React.DragEvent<HTMLButtonElement>) {
    e.preventDefault();
    setIsDraggingPhoto(false);

    if (isUploading || isPreparingPhoto) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    void applyPhotoFile(file);
  }

  async function handleSubmit() {
    if (!draft.title.trim()) {
      setTitleError(true);
      return;
    }

    let photoUrl = draft.photo_url;
    const pendingFile = pendingPhotoFileRef.current;

    if (pendingFile) {
      setIsUploading(true);

      const supabase = createClient();
      const filePath = `${crypto.randomUUID()}-${pendingFile.name}`;
      const { error } = await supabase.storage
        .from("activity-photos")
        .upload(filePath, pendingFile);

      setIsUploading(false);

      if (error) {
        toast.error("Gagal unggah foto", "Coba lagi.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("activity-photos").getPublicUrl(filePath);
      photoUrl = publicUrl;
    }

    setIsSaving(true);
    const success = await onSubmit({ ...draft, photo_url: photoUrl });
    setIsSaving(false);

    if (!success) {
      toast.error("Gagal menyimpan kegiatan", "Coba lagi.");
      return;
    }
    toast.success("Kegiatan disimpan");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Isi detail kegiatan di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handlePhotoDragOver}
            onDragLeave={handlePhotoDragLeave}
            onDrop={handlePhotoDrop}
            disabled={isUploading || isPreparingPhoto}
            className={`relative aspect-video w-full bg-linear-to-br from-emerald-200 to-teal-200 rounded-2xl flex items-center justify-center overflow-hidden disabled:cursor-default ${
              isDraggingPhoto
                ? "ring-2 ring-emerald-500 ring-offset-2"
                : ""
            }`}
          >
            {draft.photo_url ? (
              <img
                src={draft.photo_url}
                alt={draft.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-6xl">{draft.emoji}</span>
            )}

            {isUploading || isPreparingPhoto ? (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">
                  {isPreparingPhoto ? "Memproses foto..." : "Mengunggah..."}
                </span>
              </div>
            ) : (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white transition-opacity ${
                  isDraggingPhoto
                    ? "bg-emerald-700/70 opacity-100"
                    : "bg-black/40 opacity-0 hover:opacity-100"
                }`}
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">
                  {isDraggingPhoto ? "Lepaskan foto di sini" : "Ganti foto"}
                </span>
                <span className="text-xs text-white/80">
                  {isDraggingPhoto
                    ? "Foto akan diproses otomatis"
                    : "Klik atau drag & drop"}
                </span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <div className="space-y-1.5">
            <Label htmlFor="activity-title">Judul</Label>
            <Input
              id="activity-title"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="mis. Pramuka"
              className="rounded-xl"
            />
            {titleError && (
              <p className="text-xs text-red-600">Judul wajib diisi.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-description">Deskripsi</Label>
            <Textarea
              id="activity-description"
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              className="rounded-xl min-h-24"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-youtube-url">
              Link YouTube (opsional)
            </Label>
            <Input
              id="activity-youtube-url"
              value={draft.youtube_url ?? ""}
              onChange={(e) =>
                updateDraft({ youtube_url: e.target.value || null })
              }
              placeholder="https://youtube.com/watch?v=..."
              className="rounded-xl"
            />
            <p className="text-xs text-gray-500">
              Kalau diisi, kartu di halaman utama akan pakai thumbnail YouTube
              ini menggantikan foto, dan diklik langsung buka videonya.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-emoji">
              Emoji (ikon kalau belum ada foto)
            </Label>
            <EmojiPicker
              id="activity-emoji"
              value={draft.emoji}
              onValueChange={(emoji) => updateDraft({ emoji })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="activity-badge">Label (opsional)</Label>
            <Input
              id="activity-badge"
              value={draft.badge}
              onChange={(e) => updateDraft({ badge: e.target.value })}
              placeholder="mis. Populer, Baru"
              className="rounded-xl"
            />
          </div>
        </div>

        <DialogFooter className="static">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isUploading || isPreparingPhoto}
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Check className="w-4 h-4" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
