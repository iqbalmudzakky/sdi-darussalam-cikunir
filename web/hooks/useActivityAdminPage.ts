import { useEffect, useRef, useState } from "react";
import type { ActivityItem } from "@/types/Activity";

export function useActivityAdminPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const newCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/activities")
      .then((res) => res.json())
      .then((data: ActivityItem[]) => setItems(data))
      .finally(() => setIsLoading(false));
  }, []);

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

  async function handleSave(updated: ActivityItem): Promise<boolean> {
    const isNew = updated.id === newlyAddedId;
    const payload = {
      title: updated.title,
      description: updated.description,
      emoji: updated.emoji,
      badge: updated.badge,
      photo_url: updated.photo_url,
    };

    const response = isNew
      ? await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch(`/api/activities/${updated.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (!response.ok) return false;

    const saved: ActivityItem = await response.json();
    const previousId = updated.id;

    setItems((prev) =>
      prev.map((item) => (item.id === previousId ? saved : item)),
    );
    if (isNew) setNewlyAddedId(null);
    return true;
  }

  async function handleDelete(id: string): Promise<boolean> {
    if (id !== newlyAddedId) {
      const response = await fetch(`/api/activities/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) return false;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
    if (id === newlyAddedId) setNewlyAddedId(null);
    return true;
  }

  return {
    items,
    isLoading,
    newlyAddedId,
    newCardRef,
    handleAddNew,
    handleSave,
    handleDelete,
  };
}
