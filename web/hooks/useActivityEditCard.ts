import { useRef, useState } from "react";
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
  const [draft, setDraft] = useState<ActivityItem>(item);
  const [titleError, setTitleError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setDraft(item);
    setTitleError(false);
    setIsEditing(true);
  }

  function updateDraft(patch: Partial<ActivityItem>) {
    setDraft((prev) => ({ ...prev, ...patch }));
    if (patch.title !== undefined) setTitleError(false);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    updateDraft({ photo_url: URL.createObjectURL(file) });
  }

  async function handleSave() {
    if (!draft.title.trim()) {
      setTitleError(true);
      return;
    }
    setSaveError(false);
    setIsSaving(true);
    const success = await onSave(draft);
    setIsSaving(false);

    if (!success) {
      setSaveError(true);
      return;
    }
    setIsEditing(false);
  }

  async function handleCancel() {
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
