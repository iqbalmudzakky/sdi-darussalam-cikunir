"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Inbox,
  LayoutGrid,
  List,
  Loader2,
  MessageCircle,
  PhoneCall,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
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
  buildRegistrationsExportUrl,
} from "@/lib/api/registrations";
import { useToast } from "@/hooks/useToast";
import { formatDateTime } from "@/lib/date";
import { RegistrationDetailDialog } from "@/components/admin/RegistrationDetailDialog";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import {
  REGISTRATION_TYPE_OPTIONS,
  getOptionLabel,
} from "@/lib/registrationOptions";
import type {
  Registration,
  RegistrationSortDirection,
  RegistrationStatus,
} from "@/types/Registration";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 600;
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
    icon: XCircle,
    activeClassName: "bg-rose-100 text-rose-700",
  },
  {
    value: "registered",
    label: "Sudah Daftar",
    icon: CheckCircle2,
    activeClassName: "bg-brand-200 text-brand-800",
  },
];
const PRIMARY_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option) => option.value === "pending" || option.value === "in_progress",
);
const FINAL_STATUS_OPTIONS = STATUS_OPTIONS.filter(
  (option) =>
    option.value === "not_registered" || option.value === "registered",
);
const PAYMENT_BADGES: Record<
  NonNullable<Registration["payment_status"]>,
  { label: string; icon: typeof Clock; className: string }
> = {
  success: {
    label: "Lunas",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  pending: {
    label: "Belum Bayar",
    icon: Clock,
    className: "bg-amber-100 text-amber-700",
  },
  failed: {
    label: "Gagal Bayar",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
  expired: {
    label: "Kedaluwarsa",
    icon: XCircle,
    className: "bg-gray-100 text-gray-600",
  },
};
const actionButtonVariants = cva(
  "flex items-center justify-center font-medium transition-colors disabled:opacity-60",
  {
    variants: {
      size: {
        pill: "flex-1 gap-1.5 rounded-lg px-2 py-2 text-xs",
        icon: "h-8 w-8 shrink-0 rounded-lg text-xs",
        row: "justify-start gap-2 rounded-lg px-3 py-2.5 text-sm",
        chip: "shrink-0 gap-1.5 rounded-full px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      size: "pill",
    },
  },
);
const CONTACT_BUTTON_CLASSNAME =
  "bg-brand-50 text-brand-700 hover:bg-brand-100";
const viewToggleButtonVariants = cva(
  "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
  {
    variants: {
      active: {
        true: "bg-white text-brand-700 shadow-sm",
        false: "text-gray-400 hover:text-gray-600",
      },
    },
  },
);
const VIEW_MODE_OPTIONS: {
  value: "card" | "list";
  label: string;
  icon: typeof LayoutGrid;
}[] = [
  { value: "card", label: "Tampilan kartu", icon: LayoutGrid },
  { value: "list", label: "Tampilan list", icon: List },
];

export default function AdminRegistrationsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<Registration | null>(null);
  const [viewMode, setViewMode] = useState<"card" | "list">("list");
  const [waPickerItem, setWaPickerItem] = useState<Registration | null>(null);
  const [finalStatusPickerItem, setFinalStatusPickerItem] =
    useState<Registration | null>(null);

  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<RegistrationStatus[]>([]);
  const [sort, setSort] = useState<RegistrationSortDirection>("desc");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportStatuses, setExportStatuses] = useState<RegistrationStatus[]>(
    [],
  );
  const isLoadingMoreRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  async function loadRegistrations(isCancelled: () => boolean) {
    setIsRefreshing(true);
    setLoadError(false);

    try {
      const page = await listRegistrations({
        search,
        statuses: statusFilter,
        sort,
        limit: PAGE_SIZE,
        offset: 0,
      });
      if (isCancelled()) return;
      setItems(page.items);
      setTotal(page.total);
      setHasMore(page.has_more);
    } catch (error) {
      if (isCancelled()) return;
      console.error("Failed to load registrations:", error);
      setLoadError(true);
    } finally {
      if (isCancelled()) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    loadRegistrations(() => cancelled);

    return () => {
      cancelled = true;
    };
  }, [search, statusFilter, sort]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) handleLoadMore();
    });

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [hasMore, items.length, search, statusFilter, sort]);

  async function handleLoadMore() {
    if (isLoadingMoreRef.current) return;
    isLoadingMoreRef.current = true;

    try {
      const page = await listRegistrations({
        search,
        statuses: statusFilter,
        sort,
        limit: PAGE_SIZE,
        offset: items.length,
      });
      setItems((prev) => [...prev, ...page.items]);
      setTotal(page.total);
      setHasMore(page.has_more);
    } catch (error) {
      console.error("Failed to load more registrations:", error);
      setHasMore(false);
      toast.error("Gagal memuat data berikutnya", "Coba refresh halaman.");
    } finally {
      isLoadingMoreRef.current = false;
    }
  }

  function toggleStatusFilter(status: RegistrationStatus) {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((value) => value !== status)
        : [...prev, status],
    );
  }

  function toggleExportStatus(status: RegistrationStatus) {
    setExportStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((value) => value !== status)
        : [...prev, status],
    );
  }

  function handleDownloadExcel() {
    window.location.href = buildRegistrationsExportUrl(exportStatuses);
    setIsExportOpen(false);
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteRegistration(confirmDeleteId);
      setItems((prev) => prev.filter((item) => item.id !== confirmDeleteId));
      setTotal((prev) => Math.max(0, prev - 1));
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
      await updateRegistrationStatus(item.id, { status });
      setItems((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, status } : r)),
      );
      window.dispatchEvent(new Event("registrations-updated"));
    } catch (error) {
      console.error("Failed to update registration status:", error);
      toast.error("Gagal memperbarui status", "Coba lagi.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  const deletingItem = items.find((item) => item.id === confirmDeleteId);
  const hasActiveFilter = search !== "" || statusFilter.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <AdminPageHeader
        title="Pendaftar"
        description="Calon siswa yang mengisi formulir pendaftaran di halaman utama."
        count={isLoading || loadError ? undefined : total}
        action={
          <div className="flex items-center gap-2">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {VIEW_MODE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setViewMode(option.value)}
                  aria-label={option.label}
                  aria-pressed={viewMode === option.value}
                  className={viewToggleButtonVariants({
                    active: viewMode === option.value,
                  })}
                >
                  <option.icon className="h-4 w-4" />
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExportOpen(true)}
              disabled={isLoading || loadError}
            >
              <Download className="w-4 h-4" />
              Download Excel
            </Button>

            <Button
              type="button"
              render={<Link href="/admin/registrations/new" />}
            >
              <Plus className="w-4 h-4" />
              Input Manual
            </Button>
          </div>
        }
      />

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nama siswa..."
              aria-label="Cari nama siswa"
              className="h-9 pr-8 pl-8"
            />

            {isRefreshing && !isLoading && (
              <Loader2 className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400" />
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setSort((prev) => (prev === "desc" ? "asc" : "desc"))
            }
            className="h-9 shrink-0"
            title={
              sort === "desc"
                ? "Urut dari pendaftar terbaru"
                : "Urut dari pendaftar terlama"
            }
          >
            {sort === "desc" ? (
              <ArrowDown className="h-4 w-4" />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
            {sort === "desc" ? "Terbaru" : "Terlama"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_OPTIONS.map((option) => {
            const isActive = statusFilter.includes(option.value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleStatusFilter(option.value)}
                aria-pressed={isActive}
                className={cn(
                  actionButtonVariants({ size: "chip" }),
                  isActive
                    ? option.activeClassName
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100",
                )}
              >
                <option.icon className="h-3.5 w-3.5" />
                {option.label}
              </button>
            );
          })}

          {statusFilter.length > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter([])}
              className="px-2 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:text-gray-600"
            >
              Reset filter
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            Gagal memuat data pendaftar. Coba refresh halaman.
          </p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={hasActiveFilter ? Search : Inbox}
          title={
            hasActiveFilter ? "Tidak ada yang cocok" : "Belum ada pendaftar"
          }
          description={
            hasActiveFilter
              ? "Coba ubah kata kunci pencarian atau filter statusnya."
              : "Data akan muncul di sini begitu ada orang tua yang mengisi formulir pendaftaran di halaman utama."
          }
        />
      ) : (
        <div
          className={cn(
            "transition-opacity",
            isRefreshing && "pointer-events-none opacity-50",
          )}
        >
          {viewMode === "card" ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300"
                >
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {item.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getOptionLabel(
                        REGISTRATION_TYPE_OPTIONS,
                        item.registration_type,
                      )}
                      {" · "}
                      {item.previous_school}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xs text-gray-400">
                      {formatDateTime(item.created_at)}
                    </p>
                    <PaymentBadge item={item} />
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={buildWhatsAppLink(item.father_phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        actionButtonVariants({ size: "pill" }),
                        CONTACT_BUTTON_CLASSNAME,
                      )}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      WA Ayah
                    </a>
                    <a
                      href={buildWhatsAppLink(item.mother_phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        actionButtonVariants({ size: "pill" }),
                        CONTACT_BUTTON_CLASSNAME,
                      )}
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
                          className={cn(
                            actionButtonVariants({ size: "pill" }),
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

                  <div className="flex gap-2 mt-auto pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDetailItem(item)}
                      className="flex-1 rounded-xl"
                    >
                      <Eye className="w-4 h-4" />
                      Lihat Detail
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex min-w-220 flex-col gap-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-gray-300"
                  >
                    <div className="min-w-50 flex-1">
                      <p className="truncate font-semibold text-gray-900">
                        {item.full_name}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {getOptionLabel(
                          REGISTRATION_TYPE_OPTIONS,
                          item.registration_type,
                        )}
                        {" · "}
                        {item.previous_school}
                      </p>
                    </div>

                    <p className="w-32 shrink-0 text-xs text-gray-400">
                      {formatDateTime(item.created_at)}
                    </p>

                    <div className="w-24 shrink-0">
                      <PaymentBadge item={item} />
                    </div>

                    <button
                      type="button"
                      onClick={() => setWaPickerItem(item)}
                      title="Hubungi Orang Tua"
                      aria-label={`Hubungi orang tua ${item.full_name}`}
                      className={cn(
                        actionButtonVariants({ size: "icon" }),
                        CONTACT_BUTTON_CLASSNAME,
                      )}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex shrink-0 gap-1 rounded-lg bg-gray-50 p-1">
                      {PRIMARY_STATUS_OPTIONS.map((option) => {
                        const isActive = item.status === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            disabled={statusUpdatingId === item.id}
                            onClick={() =>
                              handleStatusChange(item, option.value)
                            }
                            title={option.label}
                            aria-label={option.label}
                            className={cn(
                              actionButtonVariants({ size: "icon" }),
                              isActive
                                ? option.activeClassName
                                : "text-gray-400 hover:bg-gray-100",
                            )}
                          >
                            <option.icon className="h-3.5 w-3.5" />
                          </button>
                        );
                      })}
                      {(() => {
                        const activeFinalOption = FINAL_STATUS_OPTIONS.find(
                          (option) => option.value === item.status,
                        );
                        const FinalIcon =
                          activeFinalOption?.icon ?? CheckCircle2;
                        return (
                          <button
                            type="button"
                            disabled={statusUpdatingId === item.id}
                            onClick={() => setFinalStatusPickerItem(item)}
                            title={
                              activeFinalOption?.label ??
                              "Tidak Jadi / Sudah Daftar"
                            }
                            aria-label={
                              activeFinalOption?.label ?? "Pilih status akhir"
                            }
                            className={cn(
                              actionButtonVariants({ size: "icon" }),
                              activeFinalOption
                                ? activeFinalOption.activeClassName
                                : "text-gray-400 hover:bg-gray-100",
                            )}
                          >
                            <FinalIcon className="h-3.5 w-3.5" />
                          </button>
                        );
                      })()}
                    </div>

                    <div className="flex shrink-0 gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setDetailItem(item)}
                        aria-label="Lihat detail"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => setConfirmDeleteId(item.id)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Hapus"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasMore ? (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-gray-400">
              Semua {total} pendaftar sudah ditampilkan.
            </p>
          )}
        </div>
      )}

      <RegistrationDetailDialog
        registration={detailItem}
        onOpenChange={(open) => !open && setDetailItem(null)}
      />

      <Dialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hapus Data Pendaftar</DialogTitle>
            <DialogDescription>
              Yakin mau hapus data pendaftaran{" "}
              <span className="font-semibold">{deletingItem?.full_name}</span>?
              Tindakan ini tidak bisa dibatalkan.
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

      <Dialog
        open={waPickerItem !== null}
        onOpenChange={(open) => !open && setWaPickerItem(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Hubungi Orang Tua</DialogTitle>
            <DialogDescription>
              Pilih nomor WhatsApp yang mau dihubungi untuk{" "}
              <span className="font-semibold">{waPickerItem?.full_name}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <a
              href={
                waPickerItem
                  ? buildWhatsAppLink(waPickerItem.father_phone)
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setWaPickerItem(null)}
              className={cn(
                actionButtonVariants({ size: "row" }),
                CONTACT_BUTTON_CLASSNAME,
              )}
            >
              <MessageCircle className="h-4 w-4" />
              WA Ayah
            </a>
            <a
              href={
                waPickerItem
                  ? buildWhatsAppLink(waPickerItem.mother_phone)
                  : "#"
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setWaPickerItem(null)}
              className={cn(
                actionButtonVariants({ size: "row" }),
                CONTACT_BUTTON_CLASSNAME,
              )}
            >
              <MessageCircle className="h-4 w-4" />
              WA Ibu
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={finalStatusPickerItem !== null}
        onOpenChange={(open) => !open && setFinalStatusPickerItem(null)}
      >
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Ubah Status Pendaftaran</DialogTitle>
            <DialogDescription>
              Pilih status akhir untuk{" "}
              <span className="font-semibold">
                {finalStatusPickerItem?.full_name}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {FINAL_STATUS_OPTIONS.map((option) => {
              const isActive = finalStatusPickerItem?.status === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    if (finalStatusPickerItem)
                      handleStatusChange(finalStatusPickerItem, option.value);
                    setFinalStatusPickerItem(null);
                  }}
                  className={cn(
                    actionButtonVariants({ size: "row" }),
                    isActive
                      ? option.activeClassName
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Download Excel</DialogTitle>
            <DialogDescription>
              Centang status yang mau diunduh. Kalau tidak ada yang dicentang,
              semua pendaftar ikut terunduh.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            {STATUS_OPTIONS.map((option) => {
              const isChecked = exportStatuses.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  role="checkbox"
                  aria-checked={isChecked}
                  onClick={() => toggleExportStatus(option.value)}
                  className={cn(
                    actionButtonVariants({ size: "row" }),
                    isChecked
                      ? "bg-brand-50 text-brand-700"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                      isChecked
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {isChecked && <Check className="h-3 w-3" />}
                  </span>
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </button>
              );
            })}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsExportOpen(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleDownloadExcel}
              className="flex-1"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Payment state shown alongside the follow-up status, never merged into it:
 * `status` is what the admin is doing about the applicant, this is whether the
 * fee has been paid. Registrations created before the payment flow have no
 * payment row, so nothing is shown for them.
 */
function PaymentBadge({ item }: { item: Registration }) {
  if (!item.payment_status) return null;

  const badge = PAYMENT_BADGES[item.payment_status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        badge.className,
      )}
      title={item.invoice_number ?? undefined}
    >
      <badge.icon className="h-3 w-3" />
      {badge.label}
    </span>
  );
}
