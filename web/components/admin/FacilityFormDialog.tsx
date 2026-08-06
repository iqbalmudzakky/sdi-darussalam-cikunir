"use client";

import { useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import { Check, Loader2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { EMOJI_OPTIONS } from "@/lib/emojiOptions";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotoFileRef = useRef<File | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(initialValue);
      setTitleError(false);
      pendingPhotoFileRef.current = null;
    }
  }, [open]);

  const hasCustomEmoji =
    !!draft.emoji && !EMOJI_OPTIONS.some((opt) => opt.emoji === draft.emoji);

  function updateDraft(patch: Partial<FacilityFormValue>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    pendingPhotoFileRef.current = file;
    updateDraft({ photo_url: URL.createObjectURL(file) });
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
        .from("facility-photos")
        .upload(filePath, pendingFile);

      setIsUploading(false);

      if (error) {
        toast.error("Gagal unggah foto", "Coba lagi.");
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("facility-photos").getPublicUrl(filePath);
      photoUrl = publicUrl;
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
            disabled={isUploading}
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

            {isUploading ? (
              <div className={photoOverlayVariants()}>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">Mengunggah...</span>
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
            <Select
              value={draft.emoji || null}
              onValueChange={(value) => updateDraft({ emoji: value ?? "" })}
            >
              <SelectTrigger id="facility-emoji" className="rounded-xl">
                <SelectValue placeholder="Pilih emoji">
                  {(value: string | null) => {
                    if (!value) return "Pilih emoji";
                    const opt = EMOJI_OPTIONS.find((o) => o.emoji === value);
                    return opt
                      ? `${opt.emoji} ${opt.label}`
                      : `${value} (saat ini)`;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {hasCustomEmoji && (
                  <SelectItem value={draft.emoji}>
                    {draft.emoji} (saat ini)
                  </SelectItem>
                )}
                {EMOJI_OPTIONS.map((opt) => (
                  <SelectItem key={opt.emoji} value={opt.emoji}>
                    {opt.emoji} {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-1">
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
              disabled={isSaving || isUploading}
              className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="w-4 h-4" />
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
