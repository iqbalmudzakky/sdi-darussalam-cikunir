"use client";

import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import type { AdminItem } from "@/types/Admin";

type InviteAdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (
    email: string,
  ) => Promise<{ ok: true; admin: AdminItem } | { ok: false; error: string }>;
};

export function InviteAdminDialog({
  open,
  onOpenChange,
  onSubmit,
}: InviteAdminDialogProps) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail("");
      setError("");
    }
  }, [open]);

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    setIsSending(true);
    const result = await onSubmit(email.trim());
    setIsSending(false);

    if (!result.ok) {
      toast.error("Gagal mengundang admin", result.error);
      return;
    }

    toast.success("Undangan terkirim", `Tautan dikirim ke ${email.trim()}.`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Undang Admin</DialogTitle>
          <DialogDescription>
            Tautan untuk mengatur password akan dikirim ke email ini.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="admin@sdidarussalamcikunir.sch.id"
            className="rounded-xl"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSending}
            className="flex-1 bg-brand-600 text-white hover:bg-brand-700"
          >
            <Send className="w-4 h-4" />
            {isSending ? "Mengirim..." : "Kirim Undangan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
