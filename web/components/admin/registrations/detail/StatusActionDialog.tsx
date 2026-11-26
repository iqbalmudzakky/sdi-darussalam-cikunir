import { cva } from "class-variance-authority";
import { Ban, CircleAlert, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import type { RegistrationStatusAction } from "@/types/registration/Registration";

const actionIconVariants = cva(
  "flex h-14 w-14 items-center justify-center rounded-full",
  {
    variants: {
      action: {
        cancel: "bg-red-50 text-red-600",
        reactivate: "bg-brand-50 text-brand-700",
        delete: "bg-red-50 text-red-600",
      },
    },
  },
);

const confirmButtonVariants = cva("h-10 flex-1 text-white", {
  variants: {
    action: {
      cancel: "bg-red-600 hover:bg-red-700",
      reactivate: "bg-brand-600 hover:bg-brand-700",
      delete: "bg-red-600 hover:bg-red-700",
    },
  },
});

const namePillVariants = cva([
  "max-w-full truncate rounded-full border border-gray-200 bg-gray-50 px-3",
  "py-1 text-sm font-semibold text-gray-700",
]);

const warningVariants = cva([
  "flex w-full items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5",
  "text-left text-sm text-red-700",
]);

type StatusActionDialogProps = {
  action: RegistrationStatusAction | null;
  name: string;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: (action: RegistrationStatusAction) => void;
};

export function StatusActionDialog({
  action,
  name,
  isBusy,
  onClose,
  onConfirm,
}: StatusActionDialogProps) {
  const actionContent = {
    cancel: {
      title: "Batalkan pendaftar?",
      confirmLabel: "Batalkan",
      icon: Ban,
    },
    reactivate: {
      title: "Aktifkan lagi?",
      confirmLabel: "Aktifkan",
      icon: RotateCcw,
    },
    delete: {
      title: "Hapus pendaftar?",
      confirmLabel: "Hapus permanen",
      icon: Trash2,
    },
  };
  const content = action && actionContent[action];

  return (
    <Dialog open={action !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm" showCloseButton={false}>
        {action && content && (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <span className={actionIconVariants({ action })}>
                <content.icon className="h-7 w-7" />
              </span>
              <DialogTitle>{content.title}</DialogTitle>
              <p className={namePillVariants()}>{name}</p>
              {action === "delete" && (
                <p className={warningVariants()}>
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  Data yang dihapus tidak bisa dikembalikan.
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isBusy}
                className="h-10 flex-1"
              >
                Kembali
              </Button>
              <Button
                type="button"
                onClick={() => onConfirm(action)}
                disabled={isBusy}
                className={confirmButtonVariants({ action })}
              >
                {isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  content.confirmLabel
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
