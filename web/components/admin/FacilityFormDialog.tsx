"use client";

import { useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { Check, Loader2, Upload } from "lucide-react";
import { uploadPhoto } from "@/lib/api/storage";
import { prepareImageForUpload } from "@/lib/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { FacilityItem } from "@/types/Facility";

const photoButtonVariants = cva([
  "relative aspect-video w-full overflow-hidden rounded-2xl",
  "bg-linear-to-br from-emerald-200 to-teal-200",
  "flex items-center justify-center",
  "disabled:cursor-default",
]);

const photoOverlayVariants = cva([
  "absolute inset-0 flex flex-col items-center justify-center gap-1.5",
  "bg-black/40 text-white",
]);

type FacilityFormValue = Omit<FacilityItem, "id">;

type FacilityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: FacilityFormValue;
  onSubmit: (value: FacilityFormValue) => Promise<boolean>;
};

export function FacilityFormDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  onSubmit,
}: FacilityFormDialogProps) {
  const toast = useToast();
  const [draft, setDraft] = useState(initialValue);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreparingPhoto, setIsPreparingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotoFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initialValue);
      setTitleError(false);
      pendingPhotoFileRef.current = null;
    }
  }, [open]);

  function updateDraft(patch: Partial<FacilityFormValue>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPreparingPhoto(true);
    try {
      const preparedFile = await prepareImageForUpload(file);
      pendingPhotoFileRef.current = preparedFile;
      updateDraft({ photo_url: URL.createObjectURL(preparedFile) });
    } catch (error) {
      console.error("Failed to prepare facility photo:", error);
      toast.error("Gagal memproses foto", "Coba lagi.");
    } finally {
      setIsPreparingPhoto(false);
    }
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

      try {
        photoUrl = await uploadPhoto("facility-photos", pendingFile);
      } catch (error) {
        console.error("Failed to upload facility photo:", error);
        toast.error("Gagal unggah foto", "Coba lagi.");
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    }

    setIsSaving(true);
    const success = await onSubmit({ ...draft, photo_url: photoUrl });
    setIsSaving(false);
    if (!success) {
      toast.error("Gagal menyimpan fasilitas", "Coba lagi.");
      return;
    }
    toast.success("Fasilitas disimpan");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Isi detail fasilitas di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isPreparingPhoto}
            className={photoButtonVariants()}
          >
            {draft.photo_url ? (
              <img
                src={draft.photo_url}
                alt={draft.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 font-medium">Belum ada foto</span>
            )}

            {isUploading || isPreparingPhoto ? (
              <div className={photoOverlayVariants()}>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">
                  {isPreparingPhoto ? "Memproses foto..." : "Mengunggah..."}
                </span>
              </div>
            ) : (
              <div
                className={cn(
                  photoOverlayVariants(),
                  "opacity-0 hover:opacity-100 transition-opacity",
                )}
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">Ganti foto</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />

          <div className="space-y-1.5">
            <Label htmlFor="facility-title">Judul</Label>
            <Input
              id="facility-title"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="mis. Ruang Kelas"
              className="rounded-xl"
            />
            {titleError && (
              <p className="text-xs text-red-600">Judul wajib diisi.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facility-subtitle">Keterangan</Label>
            <Input
              id="facility-subtitle"
              value={draft.subtitle}
              onChange={(e) => updateDraft({ subtitle: e.target.value })}
              placeholder="mis. Ber-AC & Multimedia"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="facility-emoji">Emoji</Label>
            <EmojiPicker
              id="facility-emoji"
              value={draft.emoji}
              onValueChange={(emoji) => updateDraft({ emoji })}
            />
          </div>
        </div>

        <DialogFooter>
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
