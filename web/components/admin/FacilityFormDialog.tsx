"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
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
import type { FacilityItem } from "@/types/Facility";

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
  const [draft, setDraft] = useState(initialValue);
  const [titleError, setTitleError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (open) {
      setDraft(initialValue);
      setTitleError(false);
      setSaveError(false);
    }
  }, [open]);

  const hasCustomEmoji =
    !!draft.emoji && !EMOJI_OPTIONS.some((opt) => opt.emoji === draft.emoji);

  function updateDraft(patch: Partial<FacilityFormValue>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
  }

  async function handleSubmit() {
    if (!draft.title.trim()) {
      setTitleError(true);
      return;
    }
    setSaveError(false);
    setIsSaving(true);
    const success = await onSubmit(draft);
    setIsSaving(false);
    if (!success) {
      setSaveError(true);
      return;
    }
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

          {saveError && (
            <p className="text-xs text-red-600">Gagal menyimpan. Coba lagi.</p>
          )}

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
              disabled={isSaving}
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
