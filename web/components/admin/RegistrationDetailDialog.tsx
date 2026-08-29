import { Mail, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { buildWhatsAppLink } from "@/lib/social/whatsapp";
import { formatDateTime, parseDateOnly, formatDate } from "@/lib/formatDate";
import {
  REGISTRATION_TYPE_OPTIONS,
  GENDER_OPTIONS,
  PHYSICAL_DISABILITY_OPTIONS,
  PARENT_RELATIONSHIP_OPTIONS,
  getOptionLabel,
} from "@/lib/registrationOptions";
import type { Registration } from "@/types/Registration";

function formatBirthDate(iso: string): string {
  const date = parseDateOnly(iso);

  return date ? formatDate(date) : "-";
}

function formatRupiah(value: number): string {
  if (!value) return "-";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

const PAYMENT_STATUS_LABELS: Record<
  NonNullable<Registration["payment_status"]>,
  string
> = {
  success: "Lunas",
  pending: "Belum dibayar",
  failed: "Gagal",
  expired: "Kedaluwarsa",
};

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

type RegistrationDetailDialogProps = {
  registration: Registration | null;
  onOpenChange: (open: boolean) => void;
};

export function RegistrationDetailDialog({
  registration,
  onOpenChange,
}: RegistrationDetailDialogProps) {
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
              <p className="text-xs font-semibold uppercase text-gray-400">
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
                value={`${registration.place_of_birth}, ${formatBirthDate(registration.date_of_birth)}`}
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

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-400">
                Data Ayah
              </p>

              <DetailRow
                label="Status"
                value={getOptionLabel(
                  PARENT_RELATIONSHIP_OPTIONS,
                  registration.father_status,
                )}
              />

              <DetailRow label="Nama" value={registration.father_name} />

              <DetailRow label="NIK Ayah" value={registration.father_nik} />

              <DetailRow
                label="Tempat, tanggal lahir"
                value={`${registration.father_place_of_birth}, ${formatBirthDate(registration.father_date_of_birth)}`}
              />

              <a
                href={buildWhatsAppLink(registration.father_phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-700 hover:underline"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {registration.father_phone}
              </a>

              <DetailRow
                label="Penghasilan Ayah"
                value={formatRupiah(registration.father_income)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-400">
                Data Ibu
              </p>

              <DetailRow
                label="Status"
                value={getOptionLabel(
                  PARENT_RELATIONSHIP_OPTIONS,
                  registration.mother_status,
                )}
              />

              <DetailRow label="Nama" value={registration.mother_name} />

              <DetailRow label="NIK Ibu" value={registration.mother_nik} />

              <DetailRow
                label="Tempat, tanggal lahir"
                value={`${registration.mother_place_of_birth}, ${formatBirthDate(registration.mother_date_of_birth)}`}
              />

              <a
                href={buildWhatsAppLink(registration.mother_phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-emerald-700 hover:underline"
              >
                <Phone className="w-4 h-4 shrink-0" />
                {registration.mother_phone}
              </a>

              <DetailRow
                label="Penghasilan Ibu"
                value={formatRupiah(registration.mother_income)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-gray-400">
                Kontak
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 shrink-0" />
                {registration.parent_email || "-"}
              </div>
            </div>

            {/* Registrations made before the payment flow have no payment row. */}
            {registration.payment_status && (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-gray-400">
                  Pembayaran
                </p>

                <DetailRow
                  label="Status"
                  value={PAYMENT_STATUS_LABELS[registration.payment_status]}
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
