import Link from "next/link";
import { cva } from "class-variance-authority";
import { FileText, Folder, MessageCircle, Wallet } from "lucide-react";
import { formatRegistrationSummary } from "@/lib/registrationOptions";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import type { Registration } from "@/types/registration/Registration";
import { RegistrationStatusBadge } from "./RegistrationStatusBadge";

const markerVariants = cva(
  "flex h-7 items-center gap-1 rounded-lg px-2 text-xs font-semibold tabular-nums",
  {
    variants: {
      tone: {
        off: "bg-gray-100 text-gray-400",
        on: "bg-brand-600 text-white",
        partial: "bg-amber-100 text-amber-800",
      },
    },
  },
);

const cardVariants = cva([
  "relative flex flex-col gap-2.5 rounded-xl border border-gray-200 bg-white",
  "p-3.5 shadow-(--admin-card-shadow) transition-colors hover:border-gray-300",
]);

const rowVariants = cva([
  "relative grid items-center gap-3 border-b border-gray-100 px-4 py-2.5",
  "grid-cols-[2rem_minmax(0,1fr)_minmax(0,1.3fr)_7.5rem_10rem_2.375rem]",
  "transition-colors last:border-b-0 hover:bg-gray-50",
]);

const whatsappLinkVariants = cva([
  "relative z-10 flex h-8 w-9.5 shrink-0 items-center justify-center rounded-lg",
  "bg-green-600 text-white transition-colors hover:bg-green-700",
]);

type RegistrationItemProps = {
  item: Registration;
};

type RegistrationRowProps = RegistrationItemProps & {
  rowNumber: number;
};

export function getDocumentTone(
  received: number,
  required: number,
): "off" | "on" | "partial" {
  if (received === 0) return "off";
  return received < required ? "partial" : "on";
}

export function RegistrationCard({ item }: RegistrationItemProps) {
  return (
    <div className={cardVariants()}>
      <div className="flex items-start justify-between gap-3">
        <RegistrationName item={item} />
        <RegistrationStatusBadge status={item.status} />
      </div>

      <p className="truncate text-sm text-gray-600">
        {formatRegistrationSummary(item)}
      </p>

      <div className="flex items-center justify-between gap-3">
        <RegistrationMarkers item={item} />
        <RegistrationWhatsAppLink item={item} />
      </div>
    </div>
  );
}

export function RegistrationRow({ item, rowNumber }: RegistrationRowProps) {
  return (
    <div className={rowVariants()}>
      <span className="text-sm text-gray-400 tabular-nums">{rowNumber}</span>
      <RegistrationName item={item} />

      <p className="truncate text-sm text-gray-600">
        {formatRegistrationSummary(item)}
      </p>

      <div>
        <RegistrationStatusBadge status={item.status} />
      </div>

      <RegistrationMarkers item={item} />
      <RegistrationWhatsAppLink item={item} />
    </div>
  );
}

function RegistrationMarkers({ item }: RegistrationItemProps) {
  const received = item.received_document_count;
  const required = item.required_document_count;
  const documentTone = getDocumentTone(received, required);

  return (
    <div className="relative z-10 flex items-center gap-1.5">
      <span
        title="Form lengkap"
        aria-label={item.has_full_form ? "Form lengkap" : "Form belum lengkap"}
        className={markerVariants({ tone: item.has_full_form ? "on" : "off" })}
      >
        <FileText className="h-4 w-4" />
      </span>

      <span
        title="Lunas"
        aria-label={item.is_paid ? "Lunas" : "Belum lunas"}
        className={markerVariants({ tone: item.is_paid ? "on" : "off" })}
      >
        <Wallet className="h-4 w-4" />
      </span>

      <span
        title="Berkas"
        aria-label={`Berkas ${received} dari ${required}`}
        className={markerVariants({ tone: documentTone })}
      >
        <Folder className="h-4 w-4" />
        {received}/{required}
      </span>
    </div>
  );
}

function RegistrationWhatsAppLink({ item }: RegistrationItemProps) {
  if (!item.contact_phone) return null;

  return (
    <a
      href={buildWhatsAppLink(item.contact_phone)}
      target="_blank"
      rel="noopener noreferrer"
      title="Chat orang tua"
      aria-label={`Chat orang tua ${item.full_name}`}
      className={whatsappLinkVariants()}
    >
      <MessageCircle className="h-4 w-4" />
    </a>
  );
}

function RegistrationName({ item }: RegistrationItemProps) {
  return (
    <div className="min-w-0">
      <Link
        href={`/registrations/${item.id}`}
        className="block truncate font-semibold text-gray-900 after:absolute after:inset-0"
      >
        {item.full_name}
      </Link>
      <p className="text-xs text-gray-500 tabular-nums">
        {item.registration_number ?? "-"}
      </p>
    </div>
  );
}
