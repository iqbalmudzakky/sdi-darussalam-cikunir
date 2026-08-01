import { useRef, useState } from "react";
import type { ActivityItem } from "@/types/Activity";

type UseActivityEditCardParams = {
  item: ActivityItem;
  isNew: boolean;
  onSave: (updated: ActivityItem) => void;
  onDelete: (id: string) => void;
};

export function useActivityEditCard({
  item,
  isNew,
  onSave,
  onDelete,
}: UseActivityEditCardParams) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
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

  function handleSave() {
    if (!draft.title.trim()) {
      setTitleError(true);
      return;
    }
    onSave(draft);
    setIsEditing(false);
  }

  function handleCancel() {
    if (isNew) {
      onDelete(item.id);
      return;
    }
    setIsEditing(false);
  }

  const displayed = isEditing ? draft : item;

  return {
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
  };
}
