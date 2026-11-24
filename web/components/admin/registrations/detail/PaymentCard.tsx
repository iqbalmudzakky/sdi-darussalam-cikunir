"use client";

import { useState } from "react";
import { cva } from "class-variance-authority";
import {
  Check,
  Clock,
  Loader2,
  MessageCircle,
  Undo2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import type {
  RegistrationDetail,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";
import { MarkPaidDialog } from "./MarkPaidDialog";

const cardVariants = cva(
  "space-y-3.5 rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const stateChipVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
  {
    variants: {
      state: {
        unpaid: "border-amber-200 bg-amber-50 text-amber-700",
        waiting: "border-blue-200 bg-blue-50 text-blue-700",
        paid: "border-brand-200 bg-brand-50 text-brand-700",
      },
    },
  },
);

const dataRowVariants = cva([
  "flex items-baseline justify-between gap-4 border-b border-gray-100 py-2",
  "text-sm last:border-b-0 last:pb-0",
]);

const whatsappButtonVariants = cva([
  "flex h-11 items-center justify-center gap-2 rounded-lg bg-green-600 text-sm",
  "font-semibold text-white transition-colors hover:bg-green-700 sm:flex-1",
  "disabled:opacity-60",
]);

type PaymentCardProps = {
  registration: RegistrationDetail;
  isSaving: boolean;
  isSendingLink: boolean;
  onSave: (input: UpdateRegistrationInput) => Promise<boolean>;
  onSendLink: () => void;
};

export function PaymentCard({
  registration,
  isSaving,
  isSendingLink,
  onSave,
  onSendLink,
}: PaymentCardProps) {
  const [openDialog, setOpenDialog] = useState<"mark" | "cancel" | null>(null);
  const payment = registration.payment;
  const stateLabels = {
    unpaid: "Belum lunas",
    waiting: "Menunggu Pembayaran",
    paid: "Lunas",
  };
  const rows = [
    { label: "Metode", value: payment.method_label },
    { label: "No. kuitansi", value: payment.receipt_number },
    { label: "Dicatat oleh", value: payment.recorded_by_name },
    { label: "Waktu", value: payment.paid_at_label },
  ].filter((row) => row.value);
  const canAct =
    payment.state !== "paid" && payment.can_manage && registration.can_cancel;

  async function handleSave(input: UpdateRegistrationInput) {
    const saved = await onSave(input);
    if (saved) setOpenDialog(null);
  }

  return (
    <section className={cardVariants()}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Wallet className="h-4 w-4" />
        </span>
        <h2 className="flex-1 text-sm font-semibold text-gray-900">
          Biaya pendaftaran
        </h2>
        <span className={stateChipVariants({ state: payment.state })}>
          {payment.state === "waiting" && <Clock className="h-3 w-3" />}
          {payment.state === "paid" && <Check className="h-3 w-3" />}
          {stateLabels[payment.state]}
        </span>
        {payment.can_cancel && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setOpenDialog("cancel")}
            aria-label="Batalkan lunas"
            title="Batalkan lunas"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-xl font-semibold text-gray-900 tabular-nums">
        {payment.amount_label}
      </p>

      {payment.state === "paid" && rows.length > 0 && (
        <div>
          {rows.map((row) => (
            <div key={row.label} className={dataRowVariants()}>
              <span className="text-gray-500">{row.label}</span>
              <span className="font-semibold text-gray-900">{row.value}</span>
            </div>
          ))}
        </div>
      )}

      {canAct && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => setOpenDialog("mark")}
            className="h-11 sm:flex-1"
          >
            <Check className="h-4 w-4" />
            Tandai lunas
          </Button>
          <button
            type="button"
            onClick={onSendLink}
            disabled={isSendingLink}
            className={whatsappButtonVariants()}
          >
            {isSendingLink ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            {payment.state === "waiting"
              ? "Kirim ulang link bayar"
              : "Kirim link bayar"}
          </button>
        </div>
      )}

      <MarkPaidDialog
        open={openDialog === "mark"}
        registration={registration}
        isSaving={isSaving}
        onClose={() => setOpenDialog(null)}
        onSave={handleSave}
      />

      <Dialog
        open={openDialog === "cancel"}
        onOpenChange={(open) => !open && setOpenDialog(null)}
      >
        <DialogContent size="sm" showCloseButton={false}>
          <DialogTitle className="text-center">Batalkan lunas?</DialogTitle>
          <div className="mt-6 flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpenDialog(null)}
              disabled={isSaving}
              className="h-10 flex-1"
            >
              Kembali
            </Button>
            <Button
              type="button"
              onClick={() => handleSave({ action: "cancel_payment" })}
              disabled={isSaving}
              className="h-10 flex-1 bg-red-600 text-white hover:bg-red-700"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Batalkan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
