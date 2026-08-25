"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { getPaymentStatus } from "@/lib/api/payments";
import type { PaymentStatusView as PaymentStatus } from "@/types/Payment";

/**
 * DOKU redirects the customer back here as soon as they finish paying, but the
 * HTTP Notification that actually settles the registration arrives separately.
 * Polling for a short while covers that gap so the page usually resolves to
 * "lunas" without the parent needing to refresh.
 */
const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

type PaymentStatusViewProps = {
  invoiceNumber: string | null;
};

export function PaymentStatusView({ invoiceNumber }: PaymentStatusViewProps) {
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!invoiceNumber) {
      setIsLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      const result = await getPaymentStatus(invoiceNumber!);
      if (cancelled) return;

      setIsLoading(false);

      if (!result) {
        setNotFound(true);
        return;
      }

      setStatus(result);

      attempts += 1;
      if (result.status === "pending" && attempts < MAX_POLLS) {
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [invoiceNumber]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 text-ink-700">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        <p className="text-sm">Memeriksa status pembayaran…</p>
      </div>
    );
  }

  if (notFound || !status) {
    return (
      <Card
        icon={<XCircle className="h-12 w-12 text-red-600" />}
        title="Data pembayaran tidak ditemukan"
        description="Kami tidak dapat menemukan data pembayaran untuk tautan ini. Silakan ulangi pendaftaran atau hubungi kami."
      />
    );
  }

  if (status.status === "success") {
    return (
      <Card
        icon={<CheckCircle2 className="h-12 w-12 text-green-600" />}
        title="Pembayaran berhasil"
        description={`Terima kasih. Pendaftaran atas nama ${status.full_name} telah kami terima dan tim kami akan segera menghubungi Anda.`}
        invoiceNumber={status.invoice_number}
        amount={status.amount}
      />
    );
  }

  if (status.status === "failed" || status.status === "expired") {
    return (
      <Card
        icon={<XCircle className="h-12 w-12 text-red-600" />}
        title="Pembayaran tidak selesai"
        description="Pembayaran Anda tidak selesai atau telah kedaluwarsa. Silakan ulangi pendaftaran dari halaman utama."
        invoiceNumber={status.invoice_number}
        amount={status.amount}
      />
    );
  }

  return (
    <Card
      icon={<Clock className="h-12 w-12 text-amber-500" />}
      title="Menunggu pembayaran"
      description={`Pendaftaran atas nama ${status.full_name} akan kami proses setelah pembayaran diterima. Jika Anda sudah membayar, status akan diperbarui dalam beberapa saat.`}
      invoiceNumber={status.invoice_number}
      amount={status.amount}
    />
  );
}

type CardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  invoiceNumber?: string;
  amount?: number;
};

function Card({ icon, title, description, invoiceNumber, amount }: CardProps) {
  return (
    <div className="w-full max-w-md border border-brand-100 bg-white p-8 text-center">
      <div className="mb-4 flex justify-center">{icon}</div>

      <h1 className="mb-2 text-xl font-semibold text-ink-900">{title}</h1>
      <p className="text-sm leading-relaxed text-ink-700">{description}</p>

      {invoiceNumber && (
        <dl className="mt-6 space-y-2 border-t border-brand-100 pt-4 text-left text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-700">Nomor Invoice</dt>
            <dd className="font-medium text-ink-900">{invoiceNumber}</dd>
          </div>
          {amount !== undefined && (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-700">Nominal</dt>
              <dd className="font-medium text-ink-900">
                {formatAmount(amount)}
              </dd>
            </div>
          )}
        </dl>
      )}

      <Link
        href="/"
        className="mt-6 inline-flex w-full items-center justify-center bg-brand-600 px-5 py-3 font-medium text-white transition-colors hover:bg-brand-700"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
