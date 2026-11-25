"use client";

import { useState } from "react";
import { Check, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useToast } from "@/hooks/useToast";
import type { AdminItem, UpdateAdminInput } from "@/types/account/Admin";

type RenameAdminDialogProps = {
  item: AdminItem;
  onUpdate: (
    id: string,
    patch: UpdateAdminInput,
  ) => Promise<{ ok: boolean; error?: string }>;
};

export function RenameAdminDialog({ item, onUpdate }: RenameAdminDialogProps) {
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [fullName, setFullName] = useState(item.full_name);
  const [isSaving, setIsSaving] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) setFullName(item.full_name);
    setIsOpen(nextOpen);
  }

  async function handleSave() {
    const patch: UpdateAdminInput = { full_name: fullName.trim() };
    setIsSaving(true);
    const result = await onUpdate(item.id, patch);
    setIsSaving(false);
    if (!result.ok) {
      toast.error("Gagal menyimpan nama", result.error);
      return;
    }
    toast.success("Nama tersimpan");
    setIsOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        size="icon"
        variant="outline"
        onClick={() => handleOpenChange(true)}
        aria-label={`Ubah nama ${item.email}`}
        title="Ubah nama"
        className="h-8 w-8 text-gray-500"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah nama</DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <p className="text-sm break-all text-gray-500">{item.email}</p>
            <div className="space-y-1.5">
              <Label htmlFor={`rename-${item.id}`}>Nama</Label>
              <Input
                id={`rename-${item.id}`}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={120}
                className="rounded-xl"
              />
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-10 w-full"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
