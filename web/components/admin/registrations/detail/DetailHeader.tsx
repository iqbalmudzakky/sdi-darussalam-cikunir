import Link from "next/link";
import { ArrowLeft, Ban, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import type {
  RegistrationDetail,
  RegistrationStatusAction,
} from "@/types/registration/Registration";

type DetailHeaderProps = {
  registration: RegistrationDetail;
  onAction: (action: RegistrationStatusAction) => void;
};

export function DetailHeader({ registration, onAction }: DetailHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <Link
        href="/registrations"
        aria-label="Kembali ke daftar pendaftar"
        className="text-gray-700 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="flex-1 font-semibold text-gray-900">Pendaftar</h1>

      <Button
        variant="outline"
        size="icon"
        nativeButton={false}
        render={<Link href={`/registrations/${registration.id}/edit`} />}
        aria-label="Ubah data"
        title="Ubah data"
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {registration.can_cancel && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onAction("cancel")}
          aria-label="Batalkan pendaftar"
          title="Batalkan"
        >
          <Ban className="h-4 w-4" />
        </Button>
      )}

      {registration.can_reactivate && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onAction("reactivate")}
          aria-label="Aktifkan lagi"
          title="Aktifkan lagi"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      )}

      {registration.can_delete && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onAction("delete")}
          aria-label="Hapus pendaftar"
          title="Hapus"
          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
