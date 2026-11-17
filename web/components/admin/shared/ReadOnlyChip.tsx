import { Eye } from "lucide-react";

export function ReadOnlyChip() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1.5 pr-3 pl-2.5 text-sm font-semibold text-blue-700">
      <Eye className="h-4 w-4" />
      Read Only
    </span>
  );
}
