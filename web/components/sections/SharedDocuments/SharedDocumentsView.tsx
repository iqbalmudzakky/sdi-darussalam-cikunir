import type { ReactNode } from "react";
import Image from "next/image";
import { cva } from "class-variance-authority";
import { Download, FileText, Lock, MessageCircle } from "lucide-react";
import { formatRegistrationSummary } from "@/lib/registrationOptions";
import type { SharedDocuments } from "@/types/registration/Registration";

const cardVariants = cva("rounded-xl border border-gray-200 bg-white p-4");

const expiredCardVariants = cva(
  "flex flex-col items-center rounded-xl border border-gray-200 bg-white p-6",
);

const documentRowVariants = cva(
  "flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5",
);

const downloadButtonVariants = cva([
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-700",
  "text-white transition-colors hover:bg-brand-800",
]);

const whatsappButtonVariants = cva([
  "mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600",
  "px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700",
]);

type ValidDocuments = Extract<SharedDocuments, { status: "valid" }>;

export function SharedDocumentsView({ result }: { result: ValidDocuments }) {
  const summary = [
    result.registration_number,
    formatRegistrationSummary(result),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <SchoolFrame>
      <section className={cardVariants()}>
        <h1 className="text-lg font-semibold text-gray-900">
          {result.full_name}
        </h1>
        <p className="text-sm text-gray-500">{summary}</p>
      </section>

      {result.documents.map((document) => (
        <div key={document.kind} className={documentRowVariants()}>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {document.title}
            </p>
            <p className="text-xs text-gray-500">PDF · 1 halaman</p>
          </div>
          <a
            href={document.download_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Unduh ${document.title}`}
            className={downloadButtonVariants()}
          >
            <Download className="h-5 w-5" />
          </a>
        </div>
      ))}
    </SchoolFrame>
  );
}

export function SharedDocumentsExpired({
  whatsappUrl,
}: {
  whatsappUrl: string | null;
}) {
  return (
    <SchoolFrame>
      <section className={expiredCardVariants()}>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="mt-3 font-semibold text-gray-900">
          Link sudah tidak berlaku
        </h1>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={whatsappButtonVariants()}
          >
            <MessageCircle className="h-4 w-4" />
            Hubungi panitia
          </a>
        )}
      </section>
    </SchoolFrame>
  );
}

function SchoolFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <div className="flex flex-col items-center gap-3 pt-6 pb-1">
        <Image src="/logo.png" alt="" width={40} height={40} />
        <p className="font-semibold text-gray-900">
          SD Islam Darussalam Cikunir
        </p>
      </div>
      {children}
    </div>
  );
}
