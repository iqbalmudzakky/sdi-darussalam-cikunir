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
import type { ProgramItem } from "@/types/Program";

type ProgramFormValue = Omit<ProgramItem, "id">;

type ProgramFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: ProgramFormValue;
  onSubmit: (value: ProgramFormValue) => Promise<boolean>;
};

export function ProgramFormDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  onSubmit,
}: ProgramFormDialogProps) {
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

  function updateDraft(patch: Partial<ProgramFormValue>) {
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
      toast.error("Gagal menyimpan program", "Coba lagi.");
      return;
    }
    toast.success("Program disimpan");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Isi detail program di bawah ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="program-title">Judul</Label>
            <Input
              id="program-title"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="mis. Tahfidz Al-Qur'an"
              className="rounded-xl"
            />
            {titleError && (
              <p className="text-xs text-red-600">Judul wajib diisi.</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="program-description">Deskripsi</Label>
            <Textarea
              id="program-description"
              value={draft.description}
              onChange={(e) => updateDraft({ description: e.target.value })}
              className="rounded-xl min-h-24"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="program-emoji">Emoji</Label>
            <EmojiPicker
              id="program-emoji"
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
