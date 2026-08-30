"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import { Mail, Power, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/date";
import type { AdminItem, UpdateAdminInput } from "@/types/Admin";

type ActionResult = { ok: boolean; error?: string };

type AdminEditCardProps = {
  item: AdminItem;
  currentUserId: string;
  onUpdate: (id: string, patch: UpdateAdminInput) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  onResendInvite: (id: string) => Promise<ActionResult>;
};

const statusBadgeVariants = cva(
  ["rounded-full px-2 py-0.5 text-xs font-semibold"],
  {
    variants: {
      status: {
        invited: "bg-amber-50 text-amber-700",
        active: "bg-brand-50 text-brand-700",
        deactivated: "bg-gray-100 text-gray-500",
      },
    },
  },
);

const roleBadgeVariants = cva(
  ["rounded-full px-2 py-0.5 text-xs font-semibold"],
  {
    variants: {
      role: {
        superadmin: "bg-purple-50 text-purple-700",
        admin: "bg-gray-100 text-gray-600",
      },
    },
  },
);

const STATUS_LABEL: Record<AdminItem["status"], string> = {
  invited: "Diundang",
  active: "Aktif",
  deactivated: "Nonaktif",
};

export function AdminEditCard({
  item,
  currentUserId,
  onUpdate,
  onDelete,
  onResendInvite,
}: AdminEditCardProps) {
  const toast = useToast();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isSelf = item.id === currentUserId;

  async function handleConfirmDelete() {
    setIsDeleting(true);
    const result = await onDelete(item.id);
    setIsDeleting(false);

    if (result.ok) {
      setIsConfirmingDelete(false);
      toast.success("Admin dihapus");
    } else {
      toast.error("Gagal menghapus admin", result.error ?? "Coba lagi.");
    }
  }

  async function handleConfirmDeactivate() {
    setIsUpdating(true);
    const result = await onUpdate(item.id, { status: "deactivated" });
    setIsUpdating(false);

    if (result.ok) {
      setIsConfirmingDeactivate(false);
      toast.success("Admin dinonaktifkan");
    } else {
      toast.error("Gagal menonaktifkan admin", result.error ?? "Coba lagi.");
    }
  }

  async function handleReactivate() {
    setIsUpdating(true);
    const result = await onUpdate(item.id, { status: "active" });
    setIsUpdating(false);

    if (result.ok) {
      toast.success("Admin diaktifkan kembali");
    } else {
      toast.error("Gagal mengaktifkan admin", result.error ?? "Coba lagi.");
    }
  }

  async function handleToggleRole() {
    const nextRole = item.role === "superadmin" ? "admin" : "superadmin";
    setIsUpdating(true);
    const result = await onUpdate(item.id, { role: nextRole });
    setIsUpdating(false);

    if (result.ok) {
      toast.success(
        nextRole === "superadmin"
          ? "Dijadikan superadmin"
          : "Dijadikan admin biasa",
      );
    } else {
      toast.error("Gagal mengubah peran", result.error ?? "Coba lagi.");
    }
  }

  async function handleResendInvite() {
    setIsResending(true);
    const result = await onResendInvite(item.id);
    setIsResending(false);

    if (result.ok) {
      toast.success("Undangan dikirim ulang");
    } else {
      toast.error(
        "Gagal mengirim ulang undangan",
        result.error ?? "Coba lagi.",
      );
    }
  }

  return (
    <>
      <div className="flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300">
        <div>
          <h3 className="wrap-break-word font-semibold text-gray-900">
            {item.email}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={roleBadgeVariants({ role: item.role })}>
              {item.role === "superadmin" ? "Superadmin" : "Admin"}
            </span>
            <span className={statusBadgeVariants({ status: item.status })}>
              {STATUS_LABEL[item.status]}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Diundang {formatDate(item.created_at)}
        </p>

        {isSelf ? (
          <p className="mt-auto rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            Ini akun Anda — kelola dari halaman lain.
          </p>
        ) : (
          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            {item.status === "invited" && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleResendInvite}
                  disabled={isResending}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4" />
                  {isResending ? "Mengirim..." : "Kirim Ulang"}
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setIsConfirmingDelete(true)}
                  aria-label={`Batalkan undangan ${item.email}`}
                  className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            {item.status === "active" && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleToggleRole}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  {item.role === "superadmin" ? (
                    <ShieldOff className="h-4 w-4" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  {item.role === "superadmin"
                    ? "Jadikan Admin"
                    : "Jadikan Superadmin"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsConfirmingDeactivate(true)}
                  disabled={isUpdating}
                  className="text-gray-500"
                >
                  <Power className="h-4 w-4" />
                  Nonaktifkan
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setIsConfirmingDelete(true)}
                  aria-label={`Hapus admin ${item.email}`}
                  className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            {item.status === "deactivated" && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleReactivate}
                  disabled={isUpdating}
                  className="flex-1"
                >
                  <Power className="h-4 w-4" />
                  Aktifkan Kembali
                </Button>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setIsConfirmingDelete(true)}
                  aria-label={`Hapus admin ${item.email}`}
                  className="h-8 w-8 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      <Dialog
        open={isConfirmingDeactivate}
        onOpenChange={setIsConfirmingDeactivate}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Nonaktifkan Admin</DialogTitle>
            <DialogDescription>
              Yakin mau nonaktifkan{" "}
              <span className="font-semibold">{item.email}</span>? Mereka tidak
              akan bisa login sampai diaktifkan kembali.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsConfirmingDeactivate(false)}
              disabled={isUpdating}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDeactivate}
              disabled={isUpdating}
              className="flex-1 bg-gray-800 text-white hover:bg-gray-900"
            >
              <Power className="h-4 w-4" />
              {isUpdating ? "Memproses..." : "Ya, Nonaktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Admin</DialogTitle>
            <DialogDescription>
              Yakin mau hapus{" "}
              <span className="font-semibold">{item.email}</span>? Tindakan ini
              tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
