"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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
import type { AchievementItem } from "@/types/Achievement";

type AchievementFormValue = Omit<AchievementItem, "id">;

type AchievementFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: AchievementFormValue;
  onSubmit: (value: AchievementFormValue) => Promise<boolean>;
};

export function AchievementFormDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  onSubmit,
}: AchievementFormDialogProps) {
  const toast = useToast();
  const [draft, setDraft] = useState(initialValue);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(initialValue);
      setTitleError(false);
    }
  }, [open]);

  function updateDraft(patch: Partial<AchievementFormValue>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
  }

  async function handleSubmit() {
    if (!draft.title.trim()) {
      setTitleError(true);
      return;
    }
    setIsSaving(true);
    const success = await onSubmit(draft);
    setIsSaving(false);
    if (!success) {
      toast.error("Gagal menyimpan prestasi", "Coba lagi.");
      return;
    }
    toast.success("Prestasi disimpan");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Isi detail prestasi di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="achievement-title">Judul</Label>
            <Input
              id="achievement-title"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="mis. 1st Place"
              className="rounded-xl"
            />
            {titleError && (
              <p className="text-xs text-red-600">Judul wajib diisi.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="achievement-description">Deskripsi</Label>
            <Textarea
              id="achievement-description"
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              placeholder="mis. Lomba Tahfidz Tingkat Kota Bekasi 2025"
              className="rounded-xl min-h-24"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="achievement-emoji">Emoji</Label>
            <EmojiPicker
              id="achievement-emoji"
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
            disabled={isSaving}
            className="flex-1 bg-brand-600 text-white hover:bg-brand-700"
          >
            <Check className="w-4 h-4" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
