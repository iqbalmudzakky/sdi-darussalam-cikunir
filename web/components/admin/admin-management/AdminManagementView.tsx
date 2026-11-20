"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/shared/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { ReadOnlyChip } from "@/components/admin/shared/ReadOnlyChip";
import { Button } from "@/components/ui/button";
import { AdminEditCard } from "./AdminEditCard";
import { InviteAdminDialog } from "./InviteAdminDialog";
import {
  listAdmins,
  inviteAdmin,
  updateAdmin,
  deleteAdmin,
  resendInvite,
} from "@/lib/api/account/admins";
import type {
  AdminItem,
  AdminRole,
  InviteAdminInput,
  UpdateAdminInput,
} from "@/types/account/Admin";

export function AdminManagementView() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [roleOptions, setRoleOptions] = useState<AdminRole[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    try {
      const data = await listAdmins();
      setItems(data.admins);
      setRoleOptions(data.role_options);
      setCanManage(data.can_manage);
    } catch (error) {
      console.error("Failed to load admins:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const NETWORK_ERROR = "Gagal terhubung ke server. Periksa koneksi Anda.";

  async function handleInvite(input: InviteAdminInput) {
    try {
      const result = await inviteAdmin(input);
      if (result.ok) {
        setItems((prev) => [...prev, result.admin]);
      }
      return result;
    } catch (error) {
      console.error("Failed to invite admin:", error);
      return { ok: false as const, error: NETWORK_ERROR };
    }
  }

  async function handleUpdate(id: string, patch: UpdateAdminInput) {
    try {
      const result = await updateAdmin(id, patch);
      if (result.ok) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? result.admin : item)),
        );
      }
      return result;
    } catch (error) {
      console.error("Failed to update admin:", error);
      return { ok: false as const, error: NETWORK_ERROR };
    }
  }

  async function handleDelete(id: string) {
    try {
      const result = await deleteAdmin(id);
      if (result.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
      return result;
    } catch (error) {
      console.error("Failed to delete admin:", error);
      return { ok: false as const, error: NETWORK_ERROR };
    }
  }

  async function handleResendInvite(id: string) {
    try {
      return await resendInvite(id);
    } catch (error) {
      console.error("Failed to resend invite:", error);
      return { ok: false as const, error: NETWORK_ERROR };
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Akun"
        count={isLoading || loadError ? undefined : items.length}
        action={
          isLoading || loadError ? undefined : canManage ? (
            <Button type="button" onClick={() => setIsInviteOpen(true)}>
              <UserPlus />
              Undang
            </Button>
          ) : (
            <ReadOnlyChip />
          )
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            Gagal memuat daftar akun. Coba refresh halaman.
          </p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={ShieldCheck}
          title="Belum ada akun lain"
          description="Undang lewat email."
          action={
            canManage && (
              <Button type="button" onClick={() => setIsInviteOpen(true)}>
                <UserPlus />
                Undang
              </Button>
            )
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <AdminEditCard
              key={item.id}
              item={item}
              roleOptions={roleOptions}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onResendInvite={handleResendInvite}
            />
          ))}
        </div>
      )}

      <InviteAdminDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        roleOptions={roleOptions}
        onSubmit={handleInvite}
      />
    </div>
  );
}
