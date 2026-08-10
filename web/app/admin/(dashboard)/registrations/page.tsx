"use client";

import { useEffect, useState } from "react";
import { cva } from "class-variance-authority";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  PhoneCall,
  Trash2,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  listRegistrations,
  deleteRegistration,
  updateRegistrationStatus,
} from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";
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
    value: "completed",
    label: "Selesai",
    icon: CheckCircle2,
    activeClassName: "bg-emerald-100 text-emerald-700",
  },
];

const statusButtonVariants = cva([
  "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-60",
]);

function toWhatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminRegistrationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

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

  async function handleStatusChange(
    item: Registration,
    status: RegistrationStatus,
  ) {
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pendaftar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar calon siswa yang mengisi Formulir Pendaftaran Online di halaman
          utama.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">
          Gagal memuat data. Coba refresh halaman.
        </p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
          Belum ada pendaftar masuk.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3"
            >
              <div>
                <h3 className="font-bold text-gray-900">{item.student_name}</h3>
                <p className="text-sm text-gray-500">
                  Orang tua: {item.parent_name}
                </p>
              </div>

              <a
                href={toWhatsAppLink(item.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-700 hover:underline"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {item.whatsapp}
              </a>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 shrink-0" />
                {item.email}
              </div>

              {item.message && (
                <div className="flex gap-2 text-sm text-gray-600">
                  <MessageCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="line-clamp-3">{item.message}</p>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-auto pt-2">
                {formatDate(item.created_at)}
              </p>

              <div className="flex gap-1.5 bg-gray-50 rounded-xl p-1">
                {STATUS_OPTIONS.map((option) => {
                  const isActive = item.status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      disabled={statusUpdatingId === item.id}
                      onClick={() => handleStatusChange(item, option.value)}
                      className={cn(
                        statusButtonVariants(),
                        isActive
                          ? option.activeClassName
                          : "text-gray-400 hover:bg-gray-100",
                      )}
                    >
                      <option.icon className="w-3.5 h-3.5" />
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setConfirmDeleteId(item.id)}
                className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Hapus
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Data Pendaftar</DialogTitle>
            <DialogDescription>
              Yakin mau hapus data pendaftaran{" "}
              <span className="font-semibold">
                {deletingItem?.student_name}
              </span>
              ? Tindakan ini tidak bisa dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDeleteId(null)}
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
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
