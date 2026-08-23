"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, BookOpen } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { ProgramEditCard } from "@/components/admin/ProgramEditCard";
import { ProgramFormDialog } from "@/components/admin/ProgramFormDialog";
import {
  listPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "@/lib/api/programs";
import type { ProgramItem } from "@/types/Program";

const BLANK_PROGRAM = { emoji: "", title: "", description: "" };

export default function AdminProgramPage() {
  const [items, setItems] = useState<ProgramItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    try {
      const data = await listPrograms();
      setItems(data);
    } catch (error) {
      console.error("Failed to load programs:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(value: typeof BLANK_PROGRAM): Promise<boolean> {
    try {
      const saved = await createProgram(value);
      setItems((prev) => [...prev, saved]);
      return true;
    } catch (error) {
      console.error("Failed to create program:", error);
      return false;
    }
  }

  async function handleSave(updated: ProgramItem): Promise<boolean> {
    const payload = {
      title: updated.title,
      description: updated.description,
      emoji: updated.emoji,
    };

    try {
      const saved = await updateProgram(updated.id, payload);
      setItems((prev) =>
        prev.map((item) => (item.id === updated.id ? saved : item)),
      );
      return true;
    } catch (error) {
      console.error("Failed to save program:", error);
      return false;
    }
  }

  async function handleDelete(id: string): Promise<boolean> {
    try {
      await deleteProgram(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      return true;
    } catch (error) {
      console.error("Failed to delete program:", error);
      return false;
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Program"
        description="Program unggulan yang tampil di section Program pada halaman utama."
        count={isLoading || loadError ? undefined : items.length}
        action={
          <Button
            type="button"
            variant="gradient"
            onClick={() => setIsAddOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus />
            Tambah Program
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Gagal memuat data program. Coba refresh halaman.</p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={BookOpen}
          title="Belum ada program"
          description="Program unggulan yang ditambahkan di sini akan tampil di section Program pada halaman utama."
          action={
            <Button
              type="button"
              variant="gradient"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus />
              Tambah Program
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="h-full">
              <ProgramEditCard
                item={item}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <ProgramFormDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Tambah Program"
        initialValue={BLANK_PROGRAM}
        onSubmit={handleAdd}
      />
    </div>
  );
}
