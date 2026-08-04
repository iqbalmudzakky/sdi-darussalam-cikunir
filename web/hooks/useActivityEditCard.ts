import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityItem } from "@/types/Activity";

type UseActivityEditCardParams = {
  item: ActivityItem;
  isNew: boolean;
  onSave: (updated: ActivityItem) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
};

export function useActivityEditCard({
  item,
  isNew,
  onSave,
  onDelete,
}: UseActivityEditCardParams) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [draft, setDraft] = useState<ActivityItem>(item);
  const [titleError, setTitleError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingPhotoFileRef = useRef<File | null>(null);

  function startEditing() {
    setDraft(item);
    setTitleError(false);
    pendingPhotoFileRef.current = null;
    setIsEditing(true);
  }

  function updateDraft(patch: Partial<ActivityItem>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(false);
    pendingPhotoFileRef.current = file;
    updateDraft({ photo_url: URL.createObjectURL(file) });
  }

  async function handleSave() {
    if (!draft.title.trim()) {
      setTitleError(true);
      return;
    }

    let photoUrl = draft.photo_url;
    const pendingFile = pendingPhotoFileRef.current;

    if (pendingFile) {
      setUploadError(false);
      setIsUploading(true);

      const supabase = createClient();
      const filePath = `${crypto.randomUUID()}-${pendingFile.name}`;
      const { error } = await supabase.storage
        .from("activity-photos")
        .upload(filePath, pendingFile);

      setIsUploading(false);

      if (error) {
        setUploadError(true);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("activity-photos").getPublicUrl(filePath);
      photoUrl = publicUrl;
    }

    setSaveError(false);
    setIsSaving(true);
    const success = await onSave({ ...draft, photo_url: photoUrl });
    setIsSaving(false);

    if (!success) {
      setSaveError(true);
      return;
    }
    pendingPhotoFileRef.current = null;
    setIsEditing(false);
  }

  async function handleCancel() {
    pendingPhotoFileRef.current = null;
    if (isNew) {
      await onDelete(item.id);
      return;
    }
    setIsEditing(false);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const success = await onDelete(item.id);
    setIsDeleting(false);
    if (success) setIsConfirmingDelete(false);
  }

  const displayed = isEditing ? draft : item;

  return {
    isEditing,
    isConfirmingDelete,
    setIsConfirmingDelete,
    isSaving,
    saveError,
    isDeleting,
    isUploading,
    uploadError,
    draft: displayed,
    titleError,
    fileInputRef,
    startEditing,
    updateDraft,
    handlePhotoChange,
    handleSave,
    handleCancel,
    handleConfirmDelete,
  };
}
