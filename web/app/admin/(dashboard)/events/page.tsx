"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, PartyPopper } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { EventEditCard } from "@/components/admin/event/EventEditCard";
import { EventFormDialog } from "@/components/admin/event/EventFormDialog";
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/api/events";
import type { EventItem } from "@/types/Event";

const BLANK_EVENT: Omit<EventItem, "id" | "slug"> = {
  title: "",
  category: "",
  summary: "",
  body: "",
  poster_url: null,
  event_date: "",
  is_published: false,
};

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await listEvents();
      setItems(data);
    } catch (error) {
      console.error("Failed to load events:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const categorySuggestions = useMemo(() => {
    const categories = new Set(
      items.map((item) => item.category).filter(Boolean),
    );
    return Array.from(categories).sort();
  }, [items]);

  async function handleAdd(
    value: Omit<EventItem, "id" | "slug">,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const result = await createEvent(value);
      if (!result.ok) return result;

      setItems((prev) => [...prev, result.data]);
      return { ok: true };
    } catch (error) {
      console.error("handleAdd failed:", error);
      return { ok: false, error: "Terjadi kesalahan tak terduga." };
    }
  }

  async function handleSave(
    updated: EventItem,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const payload = {
        title: updated.title,
        category: updated.category,
        summary: updated.summary,
        body: updated.body,
        poster_url: updated.poster_url,
        event_date: updated.event_date,
        is_published: updated.is_published,
      };

      const result = await updateEvent(updated.id, payload);
      if (!result.ok) return result;

      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? result.data : item)),
      );
      return { ok: true };
    } catch (error) {
      console.error("handleSave failed:", error);
      return { ok: false, error: "Terjadi kesalahan tak terduga." };
    }
  }

  async function handleDelete(
    id: string,
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
      const result = await deleteEvent(id);
      if (!result.ok) return result;

      setItems((prev) => prev.filter((item) => item.id !== id));
      return { ok: true };
    } catch (error) {
      console.error("handleDelete failed:", error);
      return { ok: false, error: "Terjadi kesalahan tak terduga." };
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Event"
        description="Poster kegiatan bertanggal — PMB, Akram, 17-an, prestasi siswa — yang tampil di halaman Event."
        count={isLoading || loadError ? undefined : items.length}
        action={
          <Button
            type="button"
            variant="gradient"
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus />
            Tambah Event
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            Gagal memuat data event. Coba refresh halaman.
          </p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={PartyPopper}
          title="Belum ada event"
          description="Event yang ditambahkan di sini akan tampil di halaman Event dan sebagai teaser di halaman utama."
          action={
            <Button
              type="button"
              variant="gradient"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus />
              Tambah Event
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="h-full">
              <EventEditCard
                item={item}
                categorySuggestions={categorySuggestions}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <EventFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Event"
        initialValue={BLANK_EVENT}
        categorySuggestions={categorySuggestions}
        onSubmit={handleAdd}
      />
    </div>
  );
}
