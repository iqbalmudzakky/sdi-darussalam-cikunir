"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import { Download, Inbox, Loader2, Plus, Search } from "lucide-react";
import { ExportRegistrationsDialog } from "@/components/admin/registrations/ExportRegistrationsDialog";
import { RegistrationFilters } from "@/components/admin/registrations/RegistrationFilters";
import { ScopeToggle } from "@/components/admin/registrations/ScopeToggle";
import {
  RegistrationCard,
  RegistrationRow,
} from "@/components/admin/registrations/RegistrationListItems";
import { AdminEmptyState } from "@/components/admin/shared/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/shared/AdminPageHeader";
import { Button } from "@/components/ui/form/button";
import { useRegistrationList } from "@/hooks/useRegistrations";
import { cn } from "@/lib/utils";
import type { RegistrationListFilters } from "@/types/registration/Registration";

const tableVariants = cva([
  "hidden overflow-hidden rounded-xl border border-gray-200 bg-white",
  "shadow-(--admin-card-shadow) xl:block",
]);

export default function AdminRegistrationsPage() {
  const list = useRegistrationList();
  const [isExportOpen, setIsExportOpen] = useState(false);
  const isReady = !list.isLoading && !list.loadError;

  function handleScopeChange(scope: RegistrationListFilters["scope"]) {
    const patch = { scope };
    list.changeFilters(patch);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        title="Pendaftar"
        count={isReady ? list.total : undefined}
        action={
          <div className="flex items-center gap-2">
            <ScopeToggle
              scope={list.filters.scope}
              onChange={handleScopeChange}
              className="hidden sm:flex"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsExportOpen(true)}
              disabled={!isReady}
              aria-label="Download Excel"
              title="Download Excel"
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              size="icon"
              nativeButton={false}
              render={<Link href="/registrations/new" />}
              aria-label="Input manual"
              title="Input manual"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <ScopeToggle
        scope={list.filters.scope}
        onChange={handleScopeChange}
        className="mb-3 flex sm:hidden"
      />

      <RegistrationFilters
        searchInput={list.searchInput}
        isRefreshing={list.isRefreshing && !list.isLoading}
        filters={list.filters}
        academicYears={list.academicYears}
        onSearchChange={list.setSearchInput}
        onFiltersChange={list.changeFilters}
      />

      {list.isLoading && (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}

      {list.loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            Gagal memuat pendaftar.
          </p>
        </div>
      )}

      {isReady && list.items.length === 0 && (
        <AdminEmptyState
          icon={list.hasActiveFilter ? Search : Inbox}
          title={
            list.hasActiveFilter
              ? "Tidak ada yang cocok"
              : "Belum ada pendaftar"
          }
        />
      )}

      {isReady && list.items.length > 0 && (
        <div
          className={cn(
            "transition-opacity",
            list.isRefreshing && "pointer-events-none opacity-50",
          )}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:hidden">
            {list.items.map((item) => (
              <RegistrationCard key={item.id} item={item} />
            ))}
          </div>

          <div className={tableVariants()}>
            {list.items.map((item, index) => (
              <RegistrationRow
                key={item.id}
                item={item}
                rowNumber={index + 1}
              />
            ))}
          </div>

          {list.hasMore && <LoadMoreSentinel onVisible={list.loadMore} />}
        </div>
      )}

      <ExportRegistrationsDialog
        open={isExportOpen}
        onOpenChange={setIsExportOpen}
      />
    </div>
  );
}

function LoadMoreSentinel({ onVisible }: { onVisible: () => void }) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) onVisible();
    });
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <div ref={sentinelRef} className="flex justify-center py-6">
      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
    </div>
  );
}
