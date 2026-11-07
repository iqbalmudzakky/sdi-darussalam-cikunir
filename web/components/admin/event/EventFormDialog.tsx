"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ImageIcon, Loader2, Upload, CalendarDays } from "lucide-react";
import { uploadPhoto } from "@/lib/api/storage";
import { prepareImageForUpload } from "@/lib/image";
import { parseDateOnly, toDateOnly, formatDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import type { EventItem } from "@/types/Event";

type EventFormValue = Omit<EventItem, "id" | "slug">;

type EventFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: EventFormValue;
  categorySuggestions: string[];
  onSubmit: (
    value: EventFormValue,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export function EventFormDialog({
  open,
  onOpenChange,
  title,
  initialValue,
  categorySuggestions,
  onSubmit,
}: EventFormDialogProps) {
  const toast = useToast();
  const [draft, setDraft] = useState(initialValue);
  const [titleError, setTitleError] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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
      setDateError(false);
      pendingPhotoFileRef.current = null;
    }
  }, [open]);

  function updateDraft(patch: Partial<EventFormValue>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
    if (patch.event_date !== undefined) setDateError(false);
  }

  async function applyPhotoFile(file: File) {
    setIsPreparingPhoto(true);

    try {
      const preparedFile = await prepareImageForUpload(file);

      pendingPhotoFileRef.current = preparedFile;
      updateDraft({ poster_url: URL.createObjectURL(preparedFile) });
    } catch (error) {
      console.error("Failed to prepare event poster:", error);
      toast.error("Gagal memproses poster", "Coba pilih foto lain.");
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
    let hasError = false;
    if (!draft.title.trim()) {
      setTitleError(true);
      hasError = true;
    }
    if (!draft.event_date) {
      setDateError(true);
      hasError = true;
    }
    if (hasError) return;

    let posterUrl = draft.poster_url;
    const pendingFile = pendingPhotoFileRef.current;

    if (pendingFile) {
      setIsUploading(true);

      try {
        posterUrl = await uploadPhoto("event-photos", pendingFile);
      } catch (error) {
        console.error("Failed to upload event poster:", error);
        toast.error("Gagal unggah poster", "Coba lagi.");
        setIsUploading(false);
        return;
      }

      setIsUploading(false);
    }

    setIsSaving(true);
    try {
      const result = await onSubmit({ ...draft, poster_url: posterUrl });

      if (!result.ok) {
        toast.error("Gagal menyimpan event", result.error);
        return;
      }
      toast.success("Event disimpan");
      onOpenChange(false);
    } catch (error) {
      console.error("handleSubmit failed:", error);
      toast.error("Gagal menyimpan event", "Terjadi kesalahan tak terduga.");
    } finally {
      setIsSaving(false);
    }
  }

  const selectedDate = parseDateOnly(draft.event_date);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Isi detail event di bawah ini.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handlePhotoDragOver}
            onDragLeave={handlePhotoDragLeave}
            onDrop={handlePhotoDrop}
            disabled={isUploading || isPreparingPhoto}
            className={`relative mx-auto flex aspect-3/4 w-40 items-center justify-center overflow-hidden rounded-lg bg-gray-100 disabled:cursor-default sm:w-48 ${
              isDraggingPhoto ? "ring-2 ring-brand-500 ring-offset-2" : ""
            }`}
          >
            {draft.poster_url ? (
              <img
                src={draft.poster_url}
                alt={draft.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-10 w-10 text-gray-300" />
            )}

            {isUploading || isPreparingPhoto ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40 text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-sm font-medium">
                  {isPreparingPhoto ? "Memproses foto..." : "Mengunggah..."}
                </span>
              </div>
            ) : (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white transition-opacity ${
                  isDraggingPhoto
                    ? "bg-brand-700/70 opacity-100"
                    : "bg-black/40 opacity-0 hover:opacity-100"
                }`}
              >
                <Upload className="w-6 h-6" />
                <span className="text-center text-sm font-medium">
                  {isDraggingPhoto ? "Lepaskan di sini" : "Ganti poster"}
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
          <p className="text-center text-xs text-gray-500">
            Poster portrait (4:5 atau 3:4) supaya terbaca utuh di halaman event.
          </p>

          <div className="space-y-1.5">
            <Label htmlFor="event-title">Judul</Label>
            <Input
              id="event-title"
              value={draft.title}
              onChange={(e) => updateDraft({ title: e.target.value })}
              placeholder="mis. Akram 2026"
              className="rounded-xl"
            />
            {titleError && (
              <p className="text-xs text-red-600">Judul wajib diisi.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-category">Kategori</Label>
            <Input
              id="event-category"
              list="event-category-suggestions"
              value={draft.category}
              onChange={(e) => updateDraft({ category: e.target.value })}
              placeholder="mis. PMB, Akram, Prestasi, HUT RI"
              className="rounded-xl"
            />
            <datalist id="event-category-suggestions">
              {categorySuggestions.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-date">Tanggal peristiwa</Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger
                id="event-date"
                type="button"
                className="flex h-8 w-full items-center justify-between gap-2 rounded-xl border border-input bg-transparent px-2.5 text-left text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <span className={selectedDate ? "" : "text-gray-400"}>
                  {selectedDate ? formatDate(selectedDate) : "Pilih tanggal"}
                </span>
                <CalendarDays className="h-4 w-4 shrink-0 text-gray-400" />
              </PopoverTrigger>
              <PopoverContent>
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  onSelect={(date) => {
                    updateDraft({ event_date: date ? toDateOnly(date) : "" });
                    if (date) setIsDatePickerOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
            {dateError && (
              <p className="text-xs text-red-600">
                Tanggal peristiwa wajib diisi.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-summary">Ringkasan</Label>
            <Textarea
              id="event-summary"
              value={draft.summary}
              onChange={(e) => updateDraft({ summary: e.target.value })}
              placeholder="Satu-dua kalimat untuk kartu dan link WhatsApp"
              className="rounded-xl min-h-16"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="event-body">Isi</Label>
            <Textarea
              id="event-body"
              value={draft.body}
              onChange={(e) => updateDraft({ body: e.target.value })}
              placeholder="Isi lengkap. Baris kosong memisahkan paragraf."
              className="rounded-xl min-h-32"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2.5">
            <div>
              <Label htmlFor="event-published" className="text-gray-900">
                Terbitkan
              </Label>
              <p className="text-xs text-gray-500">
                Draf tidak tampil di halaman publik.
              </p>
            </div>
            <Switch
              id="event-published"
              checked={draft.is_published}
              onCheckedChange={(checked) =>
                updateDraft({ is_published: checked })
              }
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
