"use client";

import { Pencil, Upload, X, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useActivityEditCard } from "@/hooks/useActivityEditCard";
import type { ActivityItem } from "@/types/Activity";

type ActivityEditCardProps = {
  item: ActivityItem;
  isNew?: boolean;
  onSave: (updated: ActivityItem) => void;
  onDelete: (id: string) => void;
};

export function ActivityEditCard({
  item,
  isNew = false,
  onSave,
  onDelete,
}: ActivityEditCardProps) {
  const {
    isEditing,
    isConfirmingDelete,
    setIsConfirmingDelete,
    draft: displayed,
    titleError,
    fileInputRef,
    startEditing,
    updateDraft,
    handlePhotoChange,
    handleSave,
    handleCancel,
  } = useActivityEditCard({ item, isNew, onSave, onDelete });

  return (
    <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={!isEditing}
        className="relative aspect-video w-full bg-linear-to-br from-emerald-200 to-teal-200 flex items-center justify-center overflow-hidden disabled:cursor-default"
      >
        {displayed.photo_url ? (
          <img
            src={displayed.photo_url}
            alt={displayed.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl">{displayed.emoji}</span>
        )}

        {isEditing && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1.5 text-white opacity-0 hover:opacity-100 transition-opacity">
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

      <div className="p-6 space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor={`title-${item.id}`}>Judul</Label>
              <Input
                id={`title-${item.id}`}
                value={displayed.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
                placeholder="mis. Pramuka"
                className="rounded-xl"
              />
              {titleError && (
                <p className="text-xs text-red-600">Judul wajib diisi.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`description-${item.id}`}>Deskripsi</Label>
              <Textarea
                id={`description-${item.id}`}
                value={displayed.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                className="rounded-xl min-h-24"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`badge-${item.id}`}>Label (opsional)</Label>
              <Input
                id={`badge-${item.id}`}
                value={displayed.badge}
                onChange={(e) => updateDraft({ badge: e.target.value })}
                placeholder="mis. Populer, Baru"
                className="rounded-xl"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                className="flex-1"
              >
                <X className="w-4 h-4" />
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <Check className="w-4 h-4" />
                Simpan
              </Button>
            </div>
          </>
        ) : isConfirmingDelete ? (
          <>
            <p className="text-sm text-gray-700">
              Yakin mau hapus{" "}
              <span className="font-semibold">{item.title}</span>?
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onDelete(item.id)}
                className="flex-1 bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Ya, Hapus
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={startEditing}
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
          </>
        )}
      </div>

      {item.badge && !isEditing && !isConfirmingDelete && (
        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {item.badge}
        </div>
      )}
    </div>
  );
}
