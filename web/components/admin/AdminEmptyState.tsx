import type { LucideIcon } from "lucide-react";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

/*
 * Tampilan ketika sebuah daftar masih kosong.
 *
 * Dipakai bersama supaya semua halaman konten memberi
 * petunjuk yang sama, bukan hanya menampilkan ruang kosong.
 */
export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
        <Icon className="h-5 w-5" />
      </span>

      <p className="mt-4 text-sm font-semibold text-gray-900">{title}</p>

      <p className="mx-auto mt-1.5 max-w-sm text-sm text-gray-500">
        {description}
      </p>

      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
