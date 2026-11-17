import type { ReactNode } from "react";
import { cva } from "class-variance-authority";

type AdminPageHeaderProps = {
  title: string;
  description?: string;

  count?: number;

  action?: ReactNode;
};

const headerVariants = cva(
  "mb-6 flex gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:justify-between",
  {
    variants: {
      inline: {
        true: "flex-row items-center justify-between",
        false: "flex-col sm:items-end",
      },
    },
  },
);

export function AdminPageHeader({
  title,
  description,
  count,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className={headerVariants({ inline: !description })}>
      <div className="min-w-0">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            {title}
          </h1>

          {count !== undefined && (
            <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-sm font-bold text-brand-700 tabular-nums">
              {count}
            </span>
          )}
        </div>

        {description && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
