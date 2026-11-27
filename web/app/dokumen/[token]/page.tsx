import type { Metadata } from "next";
import {
  SharedDocumentsExpired,
  SharedDocumentsView,
} from "@/components/sections/SharedDocuments/SharedDocumentsView";
import { getSharedDocuments } from "@/lib/actions/registrations";

export const metadata: Metadata = {
  title: "Dokumen PMB | SDI Darussalam Cikunir",
  robots: { index: false, follow: false },
};

type SharedDocumentsPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedDocumentsPage({
  params,
}: SharedDocumentsPageProps) {
  const { token } = await params;
  const result = await getSharedDocuments(token);

  return (
    <main className="min-h-dvh bg-gray-50 px-4 py-6 sm:py-10">
      {result.status === "valid" ? (
        <SharedDocumentsView result={result} />
      ) : (
        <SharedDocumentsExpired whatsappUrl={result.whatsapp_url} />
      )}
    </main>
  );
}
