"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, ShieldCheck } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { AdminEditCard } from "./AdminEditCard";
import { InviteAdminDialog } from "./InviteAdminDialog";
import {
  listAdmins,
  inviteAdmin,
  updateAdmin,
  deleteAdmin,
  resendInvite,
} from "@/lib/api/admins";
import type { AdminItem, UpdateAdminInput } from "@/types/Admin";

type AdminManagementViewProps = {
  currentUserId: string;
};

export function AdminManagementView({
  currentUserId,
}: AdminManagementViewProps) {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  async function loadAdmins() {
    try {
      const data = await listAdmins();
      setItems(data);
    } catch (error) {
      console.error("Failed to load admins:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  const NETWORK_ERROR = "Gagal terhubung ke server. Periksa koneksi Anda.";

  async function handleInvite(email: string) {
    try {
      const result = await inviteAdmin({ email });
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
        title="Kelola Admin"
        description="Undang, ubah peran, atau nonaktifkan akun admin panel."
        count={isLoading || loadError ? undefined : items.length}
        action={
          <Button
            type="button"
            variant="gradient"
            onClick={() => setIsInviteOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus />
            Undang Admin
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
            Gagal memuat daftar admin. Coba refresh halaman.
          </p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={ShieldCheck}
          title="Belum ada admin lain"
          description="Undang admin baru lewat email untuk membantu kelola konten website."
          action={
            <Button
              type="button"
              variant="gradient"
              onClick={() => setIsInviteOpen(true)}
            >
              <Plus />
              Undang Admin
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <AdminEditCard
              key={item.id}
              item={item}
              currentUserId={currentUserId}
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
        onSubmit={handleInvite}
      />
    </div>
  );
}
