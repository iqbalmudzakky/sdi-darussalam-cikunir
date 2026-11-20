import { Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import { formatDateTime, parseDateOnly, formatDate } from "@/lib/date";
import {
  REGISTRATION_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PHYSICAL_DISABILITY_OPTIONS,
  PARENT_RELATIONSHIP_OPTIONS,
  getOptionLabel,
} from "@/lib/registrationOptions";
import type { RegistrationDetail } from "@/types/Registration";

type RegistrationDetailDialogProps = {
  registration: RegistrationDetail | null;
  onOpenChange: (open: boolean) => void;
};

export function RegistrationDetailDialog({
  registration,
  onOpenChange,
}: RegistrationDetailDialogProps) {
  const paymentStatusLabels: Record<
    NonNullable<RegistrationDetail["payment_status"]>,
    string
  > = {
    success: "Lunas",
    pending: "Belum dibayar",
    failed: "Gagal",
    expired: "Expired",
  };

  return (
    <Dialog open={registration !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detail Pendaftar</DialogTitle>
          <DialogDescription>
            Data lengkap yang diisi lewat formulir pendaftaran online.
          </DialogDescription>
        </DialogHeader>

        {registration && (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.06em] uppercase text-gray-500">
                Data Siswa
              </p>

              <DetailRow
                label="Jenis pendaftaran"
                value={getOptionLabel(
                  REGISTRATION_TYPE_OPTIONS,
                  registration.registration_type,
                )}
              />

              <DetailRow label="Nama lengkap" value={registration.full_name} />

              <DetailRow label="NIK Anak" value={registration.student_nik} />

              <DetailRow
                label="Jenis kelamin"
                value={getOptionLabel(GENDER_OPTIONS, registration.gender)}
              />

              <DetailRow
                label="Tempat, tanggal lahir"
                value={formatBirthDetail(
                  registration.place_of_birth,
                  registration.date_of_birth,
                )}
              />

              <DetailRow label="Anak ke-" value={registration.birth_order} />

              <DetailRow
                label="Jumlah saudara"
                value={registration.sibling_count}
              />

              <DetailRow
                label="Alamat sekarang"
                value={registration.current_address}
              />

              <DetailRow
                label="Kelainan jasmani"
                value={getOptionLabel(
                  PHYSICAL_DISABILITY_OPTIONS,
                  registration.physical_disability,
                )}
              />

              <DetailRow
                label="Asal sekolah"
                value={registration.previous_school}
              />

              <DetailRow label="NISN" value={registration.nisn} />
            </div>

            <ParentSection
              title="Ayah"
              parent={{
                status: registration.father_status,
                name: registration.father_name,
                nik: registration.father_nik,
                placeOfBirth: registration.father_place_of_birth,
                dateOfBirth: registration.father_date_of_birth,
                phone: registration.father_phone,
                income: registration.father_income,
              }}
            />

            <ParentSection
              title="Ibu"
              parent={{
                status: registration.mother_status,
                name: registration.mother_name,
                nik: registration.mother_nik,
                placeOfBirth: registration.mother_place_of_birth,
                dateOfBirth: registration.mother_date_of_birth,
                phone: registration.mother_phone,
                income: registration.mother_income,
              }}
            />

            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.06em] uppercase text-gray-500">
                Kontak
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 shrink-0" />
                {registration.parent_email || "-"}
              </div>
            </div>

            {registration.payment_status && (
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-[0.06em] uppercase text-gray-500">
                  Pembayaran
                </p>

                <DetailRow
                  label="Status"
                  value={paymentStatusLabels[registration.payment_status]}
                />

                <DetailRow
                  label="Nominal"
                  value={
                    registration.payment_amount
                      ? formatRupiah(registration.payment_amount)
                      : "-"
                  }
                />

                <DetailRow
                  label="Nomor invoice"
                  value={registration.invoice_number}
                />

                <DetailRow
                  label="Waktu bayar"
                  value={
                    registration.paid_at
                      ? formatDateTime(registration.paid_at)
                      : "-"
                  }
                />
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

type DetailRowProps = {
  label: string;
  value?: string | number | null;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900">{value || "-"}</span>
    </div>
  );
}

type ParentSectionProps = {
  title: string;
  parent: {
    status: string | null;
    name: string | null;
    nik: string | null;
    placeOfBirth: string | null;
    dateOfBirth: string | null;
    phone: string | null;
    income: number | null;
  };
};

function ParentSection({ title, parent }: ParentSectionProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold tracking-[0.06em] uppercase text-gray-500">
        Data {title}
      </p>

      <DetailRow
        label="Status"
        value={getOptionLabel(PARENT_RELATIONSHIP_OPTIONS, parent.status)}
      />

      <DetailRow label="Nama" value={parent.name} />

      <DetailRow label={`NIK ${title}`} value={parent.nik} />

      <DetailRow
        label="Tempat, tanggal lahir"
        value={formatBirthDetail(parent.placeOfBirth, parent.dateOfBirth)}
      />

      {parent.phone && (
        <a
          href={buildWhatsAppLink(parent.phone)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-brand-700 hover:underline"
        >
          <Phone className="w-4 h-4 shrink-0" />
          {parent.phone}
        </a>
      )}

      <DetailRow
        label={`Penghasilan ${title}`}
        value={formatRupiah(parent.income)}
      />
    </div>
  );
}

function formatBirthDate(iso: string): string {
  const date = parseDateOnly(iso);

  return date ? formatDate(date) : "-";
}

function formatBirthDetail(place: string | null, date: string | null): string {
  const parts = [place, date && formatBirthDate(date)];

  return parts.filter(Boolean).join(", ");
}

function formatRupiah(value: number | null): string {
  if (!value) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
