import { useEffect, useRef, useState } from "react";
import { MOCK_ACTIVITIES } from "@/lib/mock/Activities";
import type { ActivityItem } from "@/types/Activity";

export function useActivityAdminPage() {
  const [items, setItems] = useState<ActivityItem[]>(MOCK_ACTIVITIES);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const newCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newlyAddedId) {
      newCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [newlyAddedId]);

  function handleAddNew() {
    const id = `new-${Date.now()}`;
    const blank: ActivityItem = {
      id,
      emoji: "✨",
      title: "",
      description: "",
      badge: "",
      photo_url: null,
    };
    setItems((prev) => [...prev, blank]);
    setNewlyAddedId(id);
  }

  function handleSave(updated: ActivityItem) {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
    if (updated.id === newlyAddedId) setNewlyAddedId(null);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (id === newlyAddedId) setNewlyAddedId(null);
  }

  return {
    items,
    newlyAddedId,
    newCardRef,
    handleAddNew,
    handleSave,
    handleDelete,
  };
}
