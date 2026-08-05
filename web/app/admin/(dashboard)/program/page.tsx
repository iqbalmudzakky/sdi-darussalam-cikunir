"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Program</h1>
          <p className="text-sm text-gray-500 mt-1">
            Edit, tambah, atau hapus program unggulan sekolah.
          </p>
        </div>
        <Button
          type="button"
          variant="gradient"
          onClick={() => setIsAddOpen(true)}
          className="px-5 py-2.5 font-semibold"
        >
          <Plus />
          Tambah Program
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Gagal memuat data program. Coba refresh halaman.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
