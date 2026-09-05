"use client";

import { useEffect, useRef, useState } from "react";
import { cva } from "class-variance-authority";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Inbox,
  Loader2,
  MessageCircle,
  Receipt,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import { listPayments } from "@/lib/api/payments";
import { useToast } from "@/hooks/useToast";
import { formatDateTime } from "@/lib/date";
import { formatAmount, formatMethod, isOrphaned } from "@/lib/payment";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import {
  PAYMENT_STATUS_META,
  PaymentStatusBadge,
} from "@/components/admin/PaymentStatusBadge";
import { TransactionDetailDialog } from "@/components/admin/TransactionDetailDialog";
import type {
  ListPaymentsParams,
  Payment,
  PaymentSortDirection,
  PaymentStatus,
} from "@/types/Payment";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 600;

const FILTER_STATUSES: PaymentStatus[] = ["success", "pending"];

const chipVariants = cva(
  "flex shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
);

export default function AdminTransactionsPage() {
  const toast = useToast();

  const [items, setItems] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentStatus[]>([]);
  const [sort, setSort] = useState<PaymentSortDirection>("desc");
  const [detailItem, setDetailItem] = useState<Payment | null>(null);

  const isLoadingMoreRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  async function loadPayments(isCancelled: () => boolean) {
    setIsRefreshing(true);
    setLoadError(false);

    const params: ListPaymentsParams = {
      search,
      statuses: statusFilter,
      sort,
      limit: PAGE_SIZE,
      offset: 0,
    };

    try {
      const page = await listPayments(params);
      if (isCancelled()) return;
      setItems(page.items);
      setTotal(page.total);
      setHasMore(page.has_more);
    } catch (error) {
      if (isCancelled()) return;
      console.error("Failed to load payments:", error);
      setLoadError(true);
    } finally {
      if (isCancelled()) return;
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(
      () => setSearch(searchInput.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    loadPayments(() => cancelled);

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

    const params: ListPaymentsParams = {
      search,
      statuses: statusFilter,
      sort,
      limit: PAGE_SIZE,
      offset: items.length,
    };

    try {
      const page = await listPayments(params);
      setItems((prev) => [...prev, ...page.items]);
      setTotal(page.total);
      setHasMore(page.has_more);
    } catch (error) {
      console.error("Failed to load more payments:", error);
      setHasMore(false);
      toast.error("Gagal memuat data berikutnya", "Coba refresh halaman.");
    } finally {
      isLoadingMoreRef.current = false;
    }
  }

  function toggleStatusFilter(status: PaymentStatus) {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((value) => value !== status)
        : [...prev, status],
    );
  }

  const hasActiveFilter = search !== "" || statusFilter.length > 0;

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Transaksi"
        description="Semua pembayaran pendaftaran, online maupun tunai."
        count={isLoading || loadError ? undefined : total}
      />

      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nomor invoice, nama siswa, atau NIK..."
              aria-label="Cari transaksi"
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
                ? "Urut dari transaksi terbaru"
                : "Urut dari transaksi terlama"
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
          {FILTER_STATUSES.map((status) => {
            const meta = PAYMENT_STATUS_META[status];
            const isActive = statusFilter.includes(status);
            return (
              <button
                key={status}
                type="button"
                onClick={() => toggleStatusFilter(status)}
                aria-pressed={isActive}
                className={cn(
                  chipVariants(),
                  isActive
                    ? cn(meta.className, "ring-1 ring-current/25")
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100",
                )}
              >
                <meta.icon className="h-3.5 w-3.5" />
                {meta.label}
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
            Gagal memuat data transaksi. Coba refresh halaman.
          </p>
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState
          icon={hasActiveFilter ? Search : Inbox}
          title={
            hasActiveFilter ? "Tidak ada yang cocok" : "Belum ada transaksi"
          }
          description={
            hasActiveFilter
              ? "Coba ubah kata kunci pencarian atau filter statusnya."
              : "Data akan muncul di sini begitu ada orang tua yang memulai pembayaran pendaftaran."
          }
        />
      ) : (
        <div
          className={cn(
            "transition-opacity",
            isRefreshing && "pointer-events-none opacity-50",
          )}
        >
          <div className="overflow-x-auto">
            <div className="flex min-w-260 flex-col gap-2">
              {items.map((item) => (
                <TransactionRow
                  key={item.id}
                  item={item}
                  onOpenDetail={() => setDetailItem(item)}
                />
              ))}
            </div>
          </div>

          {hasMore ? (
            <div ref={loadMoreRef} className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            </div>
          ) : (
            <p className="py-6 text-center text-xs text-gray-400">
              Semua {total} transaksi sudah ditampilkan.
            </p>
          )}
        </div>
      )}

      <TransactionDetailDialog
        item={detailItem}
        onOpenChange={(open) => !open && setDetailItem(null)}
      />
    </div>
  );
}

function TransactionRow({
  item,
  onOpenDetail,
}: {
  item: Payment;
  onOpenDetail: () => void;
}) {
  const orphaned = isOrphaned(item);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors",
        orphaned
          ? "border-red-200 bg-red-50/40 hover:border-red-300"
          : "border-gray-200 hover:border-gray-300",
      )}
    >
      <div className="min-w-50 flex-1">
        <p className="truncate font-semibold text-gray-900">
          {item.full_name ?? "Nama tidak tercatat"}
        </p>
        <p className="truncate text-xs text-gray-500">
          NIK {item.student_nik ?? "—"}
        </p>
      </div>

      <div className="w-52 shrink-0">
        <p className="truncate font-mono text-xs text-gray-700">
          {item.invoice_number}
        </p>
        <p className="truncate text-xs text-gray-400 capitalize">
          {formatMethod(item.payment_method)}
          {item.source === "manual" && " · Manual"}
        </p>
      </div>

      <p className="w-28 shrink-0 text-sm font-medium tabular-nums text-gray-900">
        {formatAmount(item.amount)}
      </p>

      <div className="flex w-44 shrink-0 flex-col items-start gap-1.5">
        <PaymentStatusBadge status={item.status} />
        {orphaned && <OrphanedBadge />}
      </div>

      <p className="w-40 shrink-0 text-xs text-gray-400">
        {formatDateTime(item.paid_at ?? item.created_at)}
      </p>

      <a
        href={buildWhatsAppLink(item.father_phone ?? item.mother_phone)}
        target="_blank"
        rel="noopener noreferrer"
        title="Hubungi orang tua"
        aria-label={`Hubungi orang tua ${item.full_name ?? ""}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 transition-colors hover:bg-brand-100"
      >
        <MessageCircle className="h-3.5 w-3.5" />
      </a>

      <Button
        type="button"
        size="icon-sm"
        variant="outline"
        onClick={onOpenDetail}
        aria-label="Lihat detail transaksi"
        title="Lihat Detail"
      >
        <Receipt className="h-4 w-4" />
      </Button>
    </div>
  );
}

function OrphanedBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
      title="Data pendaftarannya sudah dihapus, tetapi pembayarannya tetap tercatat."
    >
      <AlertTriangle className="h-3 w-3" />
      Pendaftaran Dihapus
    </span>
  );
}
