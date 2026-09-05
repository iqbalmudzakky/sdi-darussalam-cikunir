import { AlertTriangle, MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import { formatDateTime } from "@/lib/date";
import { formatAmount, formatMethod, isOrphaned } from "@/lib/payment";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import type { Payment } from "@/types/Payment";

type TransactionDetailDialogProps = {
  item: Payment | null;
  onOpenChange: (open: boolean) => void;
};

export function TransactionDetailDialog({
  item,
  onOpenChange,
}: TransactionDetailDialogProps) {
  return (
    <Dialog open={item !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item?.full_name ?? "Detail Transaksi"}</DialogTitle>
          <DialogDescription>NIK {item?.student_nik ?? "—"}</DialogDescription>
        </DialogHeader>

        {item && (
          <div className="space-y-5">
            {isOrphaned(item) && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <p className="text-xs text-red-700">
                  Pendaftarannya sudah dihapus. Pembayaran tetap tercatat lunas.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-gray-100 px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">
                  {formatAmount(item.amount)}
                </p>
                <PaymentStatusBadge status={item.status} />
              </div>
              <p className="mt-1 font-mono text-xs break-all text-gray-500">
                {item.invoice_number}
              </p>
            </div>

            <DetailSection title="Pembayaran">
              <DetailRow
                label="Sumber"
                value={item.source === "manual" ? "Manual" : "Online (DOKU)"}
              />
              <DetailRow
                label="Metode"
                value={formatMethod(item.payment_method)}
                className="capitalize"
              />
              <DetailRow label="Acquirer" value={item.acquirer} />
              <DetailRow label="Nomor Kwitansi" value={item.receipt_number} />
              <DetailRow
                label="Dibuat"
                value={formatDateTime(item.created_at)}
              />
              <DetailRow
                label="Dibayar"
                value={item.paid_at ? formatDateTime(item.paid_at) : null}
              />
              <DetailRow
                label="Data Pendaftaran"
                value={
                  item.is_settled
                    ? "Ada"
                    : item.status === "success"
                      ? "Sudah dihapus"
                      : "Belum dibuat"
                }
              />
            </DetailSection>

            <DetailSection title="Kontak Orang Tua">
              <DetailRow label="Email" value={item.parent_email} />
              <DetailPhoneRow label="HP Ayah" phone={item.father_phone} />
              <DetailPhoneRow label="HP Ibu" phone={item.mother_phone} />
            </DetailSection>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-gray-400 uppercase">
        {title}
      </p>
      <dl className="space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string | null;
  className?: string;
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      {/* break-all, bukan truncate: email panjang harus terbaca utuh. */}
      <dd
        className={cn(
          "text-right font-medium break-all text-gray-900",
          className,
        )}
      >
        {value ?? "—"}
      </dd>
    </div>
  );
}

function DetailPhoneRow({
  label,
  phone,
}: {
  label: string;
  phone: string | null;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 last:border-0">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">
        {phone ? (
          <a
            href={buildWhatsAppLink(phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-brand-700 hover:underline"
          >
            {phone}
            <MessageCircle className="h-3.5 w-3.5 shrink-0" />
          </a>
        ) : (
          "—"
        )}
      </dd>
    </div>
  );
}
