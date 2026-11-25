"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Check, UserPlus } from "lucide-react";
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
import { ADMIN_ROLE_DOT_CLASS, ADMIN_ROLE_LABEL } from "@/lib/adminRoles";
import type {
  AdminItem,
  AdminRole,
  InviteAdminInput,
} from "@/types/account/Admin";

type InviteAdminDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleOptions: AdminRole[];
  onSubmit: (
    input: InviteAdminInput,
  ) => Promise<{ ok: true; admin: AdminItem } | { ok: false; error: string }>;
};

const roleChipVariants = cva(
  "inline-flex h-9 items-center gap-2 rounded-full border pr-3.5 pl-3 text-sm transition-colors",
  {
    variants: {
      selected: {
        true: "border-brand-600 bg-brand-50 font-semibold text-brand-800",
        false: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      },
    },
  },
);

export function InviteAdminDialog({
  open,
  onOpenChange,
  roleOptions,
  onSubmit,
}: InviteAdminDialogProps) {
  const toast = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("teacher");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setFullName("");
      setEmail("");
      setRole("teacher");
      setError("");
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit() {
    if (!fullName.trim() || !email.trim()) {
      setError("Nama dan email wajib diisi.");
      return;
    }

    const input: InviteAdminInput = {
      full_name: fullName.trim(),
      email: email.trim(),
      role,
    };
    setIsSending(true);
    const result = await onSubmit(input);
    setIsSending(false);

    if (!result.ok) {
      toast.error("Gagal mengundang", result.error);
      return;
    }

    toast.success("Undangan terkirim", `Link dikirim ke ${email.trim()}.`);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Undang Akun</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="invite-name">Nama</Label>
            <Input
              id="invite-name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError("");
              }}
              maxLength={120}
              className="rounded-xl"
            />
          </div>

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
              placeholder="nama@email.com"
              className="rounded-xl"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label>Peran</Label>
            <div className="flex flex-wrap gap-2">
              {roleOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRole(option)}
                  aria-pressed={role === option}
                  className={roleChipVariants({ selected: role === option })}
                >
                  {role === option ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span
                      className={`h-2 w-2 rounded-full ${ADMIN_ROLE_DOT_CLASS[option]}`}
                    />
                  )}
                  {ADMIN_ROLE_LABEL[option]}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSending}
            className="h-10 w-full"
          >
            <UserPlus />
            {isSending ? "Mengirim..." : "Undang"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
