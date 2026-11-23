"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { cva } from "class-variance-authority";
import {
  ArrowLeft,
  Ban,
  Check,
  FileText,
  Loader2,
  MessageCircle,
  Pencil,
  RotateCcw,
  SearchX,
} from "lucide-react";
import { AdminEmptyState } from "@/components/admin/shared/AdminEmptyState";
import { Button } from "@/components/ui/form/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useToast } from "@/hooks/useToast";
import {
  getRegistration,
  sendFormLink,
  updateRegistration,
} from "@/lib/api/registration/registrations";
import { formatNumericDateOnly } from "@/lib/date";
import { formatRegistrationSummary } from "@/lib/registrationOptions";
import type {
  RegistrationDetail,
  RegistrationDocument,
  UpdateRegistrationInput,
} from "@/types/registration/Registration";
import { RegistrationDetailDialog } from "./RegistrationDetailDialog";
import { getDocumentTone } from "./RegistrationListItems";
import { RegistrationStatusBadge } from "./RegistrationStatusBadge";

type StatusAction = "cancel" | "reactivate";

const cardVariants = cva(
  "rounded-xl border border-gray-200 bg-white p-4 shadow-(--admin-card-shadow)",
);

const dataRowVariants = cva([
  "flex items-baseline justify-between gap-4 border-b border-gray-100 py-2",
  "text-sm last:border-b-0 last:pb-0",
]);

const chatButtonVariants = cva([
  "flex h-11 items-center justify-center gap-2 rounded-lg bg-green-600 sm:flex-1",
  "text-sm font-semibold text-white transition-colors hover:bg-green-700",
]);

const documentCountVariants = cva("text-sm font-semibold tabular-nums", {
  variants: {
    tone: {
      off: "text-gray-400",
      on: "text-brand-700",
      partial: "text-amber-700",
    },
  },
});

const documentButtonVariants = cva(
  [
    "flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm",
    "transition-colors disabled:cursor-not-allowed disabled:opacity-60",
  ],
  {
    variants: {
      received: {
        true: "border-brand-600 bg-brand-50 font-semibold text-brand-800",
        false: "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
      },
    },
  },
);

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

type RegistrationDetailViewProps = {
  id: string;
};

export function RegistrationDetailView({ id }: RegistrationDetailViewProps) {
  const toast = useToast();
  const [registration, setRegistration] = useState<RegistrationDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [isFullFormOpen, setIsFullFormOpen] = useState(false);
  const [isSendingLink, setIsSendingLink] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getRegistration(id);
        if (!cancelled) setRegistration(data);
      } catch (error) {
        console.error("Failed to load registration:", error);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function saveChange(input: UpdateRegistrationInput): Promise<boolean> {
    setIsSaving(true);
    try {
      const result = await updateRegistration(id, input);
      if (!result.ok) {
        toast.error(result.error);
        return false;
      }
      setRegistration(result.registration);
      return true;
    } catch (error) {
      console.error("Failed to update registration:", error);
      toast.error("Gagal menyimpan");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendFormLink() {
    const whatsappWindow = window.open("", "_blank");
    setIsSendingLink(true);
    try {
      const result = await sendFormLink(id);
      if (!result.ok) {
        whatsappWindow?.close();
        toast.error(result.error);
        return;
      }
      if (whatsappWindow) whatsappWindow.location.href = result.whatsappUrl;
      else window.location.href = result.whatsappUrl;
    } catch (error) {
      console.error("Failed to send form link:", error);
      whatsappWindow?.close();
      toast.error("Gagal membuat link form lengkap");
    } finally {
      setIsSendingLink(false);
    }
  }

  async function handleStatusAction(action: StatusAction) {
    const input: UpdateRegistrationInput = { action };
    const saved = await saveChange(input);
    if (!saved) return;
    setPendingAction(null);
    window.dispatchEvent(new Event("registrations-updated"));
  }

  function handleToggleDocument(document: RegistrationDocument["code"]) {
    const input: UpdateRegistrationInput = {
      action: "toggle_document",
      document,
    };
    saveChange(input);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!registration) {
    return (
      <AdminEmptyState
        icon={SearchX}
        title={loadError ? "Gagal memuat pendaftar" : "Pendaftar tidak ada"}
      />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-3">
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
            onClick={() => setPendingAction("cancel")}
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
            onClick={() => setPendingAction("reactivate")}
            aria-label="Aktifkan lagi"
            title="Aktifkan lagi"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <SummaryCard
        registration={registration}
        isSendingLink={isSendingLink}
        onSendFormLink={handleSendFormLink}
        onOpenFullForm={() => setIsFullFormOpen(true)}
      />

      <div className="grid items-start gap-3 md:grid-cols-2">
        <section className={cardVariants()}>
          <h2 className="mb-1 text-sm font-semibold text-gray-900">Anak</h2>
          <DataRow
            label="Tanggal lahir"
            value={formatNumericDateOnly(registration.date_of_birth)}
          />
          <DataRow
            label="Usia per 1 Juli"
            value={registration.entry_age_label}
          />
          <DataRow label="Asal sekolah" value={registration.previous_school} />
        </section>

        <section className={cardVariants()}>
          <h2 className="mb-1 text-sm font-semibold text-gray-900">
            Orang tua
          </h2>
          <DataRow label="Nama" value={registration.contact_name} />
          <DataRow label="WhatsApp" value={registration.contact_phone} />
        </section>
      </div>

      <DocumentsCard
        registration={registration}
        isSaving={isSaving}
        onToggle={handleToggleDocument}
      />

      <StatusActionDialog
        action={pendingAction}
        name={registration.full_name}
        isBusy={isSaving}
        onClose={() => setPendingAction(null)}
        onConfirm={handleStatusAction}
      />

      <RegistrationDetailDialog
        registration={isFullFormOpen ? registration : null}
        onOpenChange={(open) => !open && setIsFullFormOpen(false)}
      />
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={dataRowVariants()}>
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="min-w-0 text-right font-semibold break-words text-gray-900">
        {value || "-"}
      </span>
    </div>
  );
}

type SummaryCardProps = {
  registration: RegistrationDetail;
  isSendingLink: boolean;
  onSendFormLink: () => void;
  onOpenFullForm: () => void;
};

function SummaryCard({
  registration,
  isSendingLink,
  onSendFormLink,
  onOpenFullForm,
}: SummaryCardProps) {
  const summaryParts = [
    registration.registration_number,
    formatRegistrationSummary(registration),
  ];
  const summary = summaryParts.filter(Boolean).join(" · ");

  return (
    <section className={cardVariants()}>
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 text-lg font-semibold break-words text-gray-900">
          {registration.full_name}
        </h2>
        <RegistrationStatusBadge status={registration.status} />
      </div>

      <p className="mt-1 text-sm text-gray-600">{summary}</p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        {registration.can_send_form_link && (
          <button
            type="button"
            onClick={onSendFormLink}
            disabled={isSendingLink}
            className={chatButtonVariants()}
          >
            {isSendingLink ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            Kirim form lengkap
          </button>
        )}

        {registration.has_full_form && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenFullForm}
            className="h-11 sm:flex-1"
          >
            <FileText className="h-4 w-4" />
            Lihat form lengkap
          </Button>
        )}
      </div>
    </section>
  );
}

type DocumentsCardProps = {
  registration: RegistrationDetail;
  isSaving: boolean;
  onToggle: (document: RegistrationDocument["code"]) => void;
};

function DocumentsCard({
  registration,
  isSaving,
  onToggle,
}: DocumentsCardProps) {
  const received = registration.received_document_count;
  const required = registration.required_document_count;
  const tone = getDocumentTone(received, required);

  return (
    <section className={cardVariants()}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">Berkas diterima</h2>
        <span className={documentCountVariants({ tone })}>
          {received}/{required}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {registration.documents.map((document) => (
          <button
            key={document.code}
            type="button"
            role="checkbox"
            aria-checked={document.received}
            disabled={isSaving}
            onClick={() => onToggle(document.code)}
            className={documentButtonVariants({ received: document.received })}
          >
            {document.received && <Check className="h-4 w-4 shrink-0" />}
            <span className="truncate">{document.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

type StatusActionDialogProps = {
  action: StatusAction | null;
  name: string;
  isBusy: boolean;
  onClose: () => void;
  onConfirm: (action: StatusAction) => void;
};

function StatusActionDialog({
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
