import { cva } from "class-variance-authority";
import { Ban, Loader2, RotateCcw } from "lucide-react";
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
      },
    },
  },
);

const confirmButtonVariants = cva("h-10 flex-1 text-white", {
  variants: {
    action: {
      cancel: "bg-red-600 hover:bg-red-700",
      reactivate: "bg-brand-600 hover:bg-brand-700",
    },
  },
});

const namePillVariants = cva([
  "max-w-full truncate rounded-full border border-gray-200 bg-gray-50 px-3",
  "py-1 text-sm font-semibold text-gray-700",
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
