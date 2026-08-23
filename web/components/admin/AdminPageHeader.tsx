import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  description: string;

  /*
   * Jumlah item yang sedang dikelola. Ditampilkan sebagai
   * lencana di samping judul supaya admin langsung tahu
   * isi halaman tanpa menghitung kartu.
   */
  count?: number;

  action?: ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  count,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            {title}
          </h1>

          {count !== undefined && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 tabular-nums">
              {count}
            </span>
          )}
        </div>

        <p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
