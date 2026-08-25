import type { Metadata } from "next";
import { Suspense } from "react";
import { PaymentStatusView } from "@/components/sections/PaymentStatus/PaymentStatusView";

export const metadata: Metadata = {
  title: "Status Pembayaran Pendaftaran | SDI Darussalam Cikunir",
  description: "Halaman status pembayaran pendaftaran siswa baru.",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ invoice?: string }>;
};

export default async function PaymentStatusPage({ searchParams }: PageProps) {
  const { invoice } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-4 py-16">
      <Suspense>
        <PaymentStatusView invoiceNumber={invoice ?? null} />
      </Suspense>
    </main>
  );
}
