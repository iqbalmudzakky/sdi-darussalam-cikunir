"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import {
  Calendar,
  Loader2,
  Mail,
  Power,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/form/select";
import { useToast } from "@/hooks/useToast";
import { ADMIN_ROLE_DOT_CLASS, ADMIN_ROLE_LABEL } from "@/lib/adminRoles";
import { formatDate } from "@/lib/date";
import type {
  AdminItem,
  AdminRole,
  UpdateAdminInput,
} from "@/types/account/Admin";

type ActionResult = { ok: boolean; error?: string };

type AdminEditCardProps = {
  item: AdminItem;
  roleOptions: AdminRole[];
  onUpdate: (id: string, patch: UpdateAdminInput) => Promise<ActionResult>;
  onDelete: (id: string) => Promise<ActionResult>;
  onResendInvite: (id: string) => Promise<ActionResult>;
};

type RoleSelectProps = {
  item: AdminItem;
  roleOptions: AdminRole[];
  disabled: boolean;
  onChange: (role: AdminRole) => void;
};

type ConfirmActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  email: string;
  confirmLabel: string;
  icon: LucideIcon;
  tone: "neutral" | "danger";
  isBusy: boolean;
  onConfirm: () => void;
};

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-2 text-xs font-semibold",
  {
    variants: {
      status: {
        invited: "border-amber-200 bg-amber-50 text-amber-800",
        active: "border-brand-200 bg-brand-50 text-brand-700",
        deactivated: "border-gray-200 bg-gray-100 text-gray-600",
      },
    },
  },
);

const statusDotVariants = cva("h-1.5 w-1.5 rounded-full", {
  variants: {
    status: {
      invited: "bg-amber-500",
      active: "bg-brand-600",
      deactivated: "bg-gray-400",
    },
  },
});

const confirmIconVariants = cva(
  "flex h-16 w-16 items-center justify-center rounded-full",
  {
    variants: {
      tone: {
        neutral: "bg-gray-100 text-gray-700",
        danger: "bg-red-50 text-red-600",
      },
    },
  },
);

const confirmButtonVariants = cva("h-10 flex-1 text-white", {
  variants: {
    tone: {
      neutral: "bg-brand-600 hover:bg-brand-700",
      danger: "bg-red-600 hover:bg-red-700",
    },
  },
});

const iconButtonClassName = "h-9 w-9 text-gray-500";
const deleteButtonClassName =
  "h-9 w-9 text-gray-500 hover:border-red-200 hover:bg-red-50 hover:text-red-700";
const cardVariants = cva(
  "flex h-full flex-col gap-3 rounded-xl p-4 shadow-(--admin-card-shadow) transition-colors",
  {
    variants: {
      self: {
        true: "border-[1.5px] border-brand-300 bg-brand-50",
        false: "border border-gray-200 bg-white hover:border-gray-300",
      },
    },
  },
);

const readOnlyRoleVariants = cva(
  "mt-auto flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-gray-900",
  {
    variants: {
      self: {
        true: "border-brand-200 bg-white",
        false: "border-gray-200 bg-gray-50",
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
  roleOptions,
  onUpdate,
  onDelete,
  onResendInvite,
}: AdminEditCardProps) {
  const toast = useToast();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  async function runAction(
    action: () => Promise<ActionResult>,
    messages: { success: string; failure: string },
  ) {
    setIsBusy(true);
    const result = await action();
    setIsBusy(false);

    if (!result.ok) {
      toast.error(messages.failure, result.error ?? "Coba lagi.");
      return false;
    }

    toast.success(messages.success);
    return true;
  }

  async function handleRoleChange(role: AdminRole) {
    await runAction(() => onUpdate(item.id, { role }), {
      success: `Peran diubah ke ${ADMIN_ROLE_LABEL[role]}`,
      failure: "Gagal mengubah peran",
    });
  }

  async function handleReactivate() {
    await runAction(() => onUpdate(item.id, { status: "active" }), {
      success: "Akun diaktifkan kembali",
      failure: "Gagal mengaktifkan akun",
    });
  }

  async function handleResendInvite() {
    await runAction(() => onResendInvite(item.id), {
      success: "Undangan dikirim ulang",
      failure: "Gagal mengirim ulang undangan",
    });
  }

  async function handleConfirmDeactivate() {
    const done = await runAction(
      () => onUpdate(item.id, { status: "deactivated" }),
      { success: "Akun dinonaktifkan", failure: "Gagal menonaktifkan akun" },
    );
    if (done) setIsConfirmingDeactivate(false);
  }

  async function handleConfirmDelete() {
    const done = await runAction(() => onDelete(item.id), {
      success: "Akun dihapus",
      failure: "Gagal menghapus akun",
    });
    if (done) setIsConfirmingDelete(false);
  }

  return (
    <>
      <div className={cardVariants({ self: item.is_self })}>
        <h3 className="font-semibold wrap-break-word text-gray-900">
          {item.email}
        </h3>

        <div className="flex flex-wrap items-center gap-2">
          <span className={statusBadgeVariants({ status: item.status })}>
            <span className={statusDotVariants({ status: item.status })} />
            {STATUS_LABEL[item.status]}
          </span>
          {item.is_self ? (
            <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-bold text-white">
              Anda
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3.5 w-3.5 text-gray-400" />
              {formatDate(item.created_at)}
            </span>
          )}
        </div>

        {item.can_manage ? (
          <div className="mt-auto flex items-center gap-2">
            <RoleSelect
              item={item}
              roleOptions={roleOptions}
              disabled={isBusy}
              onChange={handleRoleChange}
            />

            {item.status === "invited" && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleResendInvite}
                disabled={isBusy}
                aria-label={`Kirim ulang undangan ${item.email}`}
                className={iconButtonClassName}
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}

            {item.status !== "invited" && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={
                  item.status === "active"
                    ? () => setIsConfirmingDeactivate(true)
                    : handleReactivate
                }
                disabled={isBusy}
                aria-label={
                  item.status === "active"
                    ? `Nonaktifkan ${item.email}`
                    : `Aktifkan kembali ${item.email}`
                }
                className={iconButtonClassName}
              >
                <Power className="h-4 w-4" />
              </Button>
            )}

            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => setIsConfirmingDelete(true)}
              disabled={isBusy}
              aria-label={`Hapus ${item.email}`}
              className={deleteButtonClassName}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className={readOnlyRoleVariants({ self: item.is_self })}>
            <span
              className={`h-2 w-2 rounded-full ${ADMIN_ROLE_DOT_CLASS[item.role]}`}
            />
            {ADMIN_ROLE_LABEL[item.role]}
          </div>
        )}
      </div>

      <ConfirmActionDialog
        open={isConfirmingDeactivate}
        onOpenChange={setIsConfirmingDeactivate}
        title="Nonaktifkan akun?"
        email={item.email}
        confirmLabel="Nonaktifkan"
        icon={Power}
        tone="neutral"
        isBusy={isBusy}
        onConfirm={handleConfirmDeactivate}
      />

      <ConfirmActionDialog
        open={isConfirmingDelete}
        onOpenChange={setIsConfirmingDelete}
        title="Hapus akun?"
        email={item.email}
        confirmLabel="Hapus"
        icon={Trash2}
        tone="danger"
        isBusy={isBusy}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function RoleSelect({
  item,
  roleOptions,
  disabled,
  onChange,
}: RoleSelectProps) {
  return (
    <Select
      items={roleOptions.map((role) => ({
        value: role,
        label: ADMIN_ROLE_LABEL[role],
      }))}
      value={item.role}
      onValueChange={(value) => value && onChange(value as AdminRole)}
      disabled={disabled}
    >
      <SelectTrigger
        aria-label={`Peran ${item.email}`}
        className="h-9 flex-1 font-semibold"
      >
        <span className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${ADMIN_ROLE_DOT_CLASS[item.role]}`}
          />
          <SelectValue />
        </span>
      </SelectTrigger>
      <SelectContent>
        {roleOptions.map((role) => (
          <SelectItem key={role} value={role}>
            {ADMIN_ROLE_LABEL[role]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  email,
  confirmLabel,
  icon: Icon,
  tone,
  isBusy,
  onConfirm,
}: ConfirmActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" showCloseButton={false}>
        <div className="flex flex-col items-center gap-3.5 text-center">
          <span className={confirmIconVariants({ tone })}>
            <Icon className="h-7 w-7" />
          </span>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 py-1 pr-3 pl-2.5 text-sm font-semibold text-gray-700">
            <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span className="truncate">{email}</span>
          </span>
        </div>

        <div className="mt-6 flex gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isBusy}
            className="h-10 flex-1"
          >
            Batal
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={confirmButtonVariants({ tone })}
          >
            {isBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
