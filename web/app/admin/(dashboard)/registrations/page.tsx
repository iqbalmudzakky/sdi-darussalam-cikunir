"use client";

import { useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import { CheckCircle2, Clock, Download, Eye, Inbox, Loader2, MessageCircle, PhoneCall, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { listRegistrations, deleteRegistration, updateRegistrationStatus } from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";
import { formatDateTime } from "@/lib/formatDate";
import { RegistrationDetailDialog } from "@/components/admin/RegistrationDetailDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { REGISTRATION_TYPE_OPTIONS, getOptionLabel } from "@/lib/registrationOptions";
import type { Registration, RegistrationStatus } from "@/types/Registration";

const STATUS_OPTIONS: {
  value: RegistrationStatus;
  label: string;
  icon: typeof Clock;
  activeClassName: string;
}[] = [
  {
    value: "pending",
    label: "Belum",
    icon: Clock,
    activeClassName: "bg-amber-100 text-amber-700",
  },
  {
    value: "in_progress",
    label: "Proses",
    icon: PhoneCall,
    activeClassName: "bg-blue-100 text-blue-700",
  },
  {
    value: "not_registered",
    label: "Tidak Jadi",
    icon: CheckCircle2,
    activeClassName: "bg-gray-100 text-gray-700",
  },
  {
    value: "registered",
    label: "Sudah Daftar",
    icon: CheckCircle2,
    activeClassName: "bg-brand-100 text-brand-700",
  },
];

const statusButtonVariants = cva(["flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"]);

export default function AdminRegistrationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<Registration | null>(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    try {
      const data = await listRegistrations();
      setItems(data);
    } catch (error) {
      console.error("Failed to load registrations:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadExcel() {
    window.location.href = "/api/registrations/export";
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteRegistration(confirmDeleteId);
      setItems((prev) => prev.filter((item) => item.id !== confirmDeleteId));
      setConfirmDeleteId(null);
      toast.success("Data pendaftar dihapus");
    } catch (error) {
      console.error("Failed to delete registration:", error);
      toast.error("Gagal menghapus data pendaftar", "Coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleStatusChange(item: Registration, status: RegistrationStatus) {
    if (item.status === status || statusUpdatingId) return;
    setStatusUpdatingId(item.id);
    try {
      const updated = await updateRegistrationStatus(item.id, { status });
      setItems((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
      window.dispatchEvent(new Event("registrations-updated"));
    } catch (error) {
      console.error("Failed to update registration status:", error);
      toast.error("Gagal memperbarui status", "Coba lagi.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  const deletingItem = items.find((item) => item.id === confirmDeleteId);

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Pendaftar"
        description="Calon siswa yang mengisi formulir pendaftaran di halaman utama."
        count={isLoading || loadError ? undefined : items.length}
        action={
          <Button type="button" onClick={handleDownloadExcel} disabled={isLoading || loadError || items.length === 0}>
            <Download className="w-4 h-4" />
            Download Excel
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">Gagal memuat data pendaftar. Coba refresh halaman.</p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState icon={Inbox} title="Belum ada pendaftar" description="Data akan muncul di sini begitu ada orang tua yang mengisi formulir pendaftaran di halaman utama." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300">
              <div>
                <h3 className="font-bold text-gray-900">{item.full_name}</h3>
                <p className="text-sm text-gray-500">
                  {getOptionLabel(REGISTRATION_TYPE_OPTIONS, item.registration_type)}
                  {" · "}
                  {item.previous_school}
                </p>
              </div>

              <p className="text-xs text-gray-400">
                {formatDateTime(item.created_at)}
              </p>

              <div className="flex gap-2">
                <a
                  href={buildWhatsAppLink(item.father_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WA Ayah
                </a>
                <a
                  href={buildWhatsAppLink(item.mother_phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WA Ibu
                </a>
              </div>

              <div className="flex gap-1.5 bg-gray-50 rounded-xl p-1">
                {STATUS_OPTIONS.map((option) => {
                  const isActive = item.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={statusUpdatingId === item.id}
                      onClick={() => handleStatusChange(item, option.value)}
                      className={cn(statusButtonVariants(), isActive ? option.activeClassName : "text-gray-400 hover:bg-gray-100")}
                    >
                      <option.icon className="w-3.5 h-3.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-auto pt-1">
                <Button type="button" size="sm" variant="outline" onClick={() => setDetailItem(item)} className="flex-1 rounded-xl">
                  <Eye className="w-4 h-4" />
                  Lihat Detail
                </Button>

                <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDeleteId(item.id)} className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RegistrationDetailDialog registration={detailItem} onOpenChange={(open) => !open && setDetailItem(null)} />

      <Dialog open={confirmDeleteId !== null} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Data Pendaftar</DialogTitle>
            <DialogDescription>
              Yakin mau hapus data pendaftaran <span className="font-semibold">{deletingItem?.full_name}</span>? Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setConfirmDeleteId(null)} disabled={isDeleting} className="flex-1">
              Batal
            </Button>
            <Button type="button" onClick={handleConfirmDelete} disabled={isDeleting} className="flex-1 bg-red-600 text-white hover:bg-red-700">
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
