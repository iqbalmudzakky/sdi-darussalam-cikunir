import type { RegistrationPaymentSummary } from "@/modules/payment/entity";
import type {
  RegistrationFormParentResponse,
  RegistrationFormRowResponse,
  RegistrationFormSectionResponse,
  RegistrationFullFormResponse,
} from "@/modules/registration-admin/dto";
import type {
  FormBiodata,
  RegistrationParentRow,
} from "@/modules/registration-biodata/entity";
import type {
  PpdbRegistrationFormRow,
  PpdbRegistrationFullRow,
} from "@/modules/registration/entity";
import {
  ACHIEVEMENT_CATEGORY_LABEL,
  ACHIEVEMENT_LEVEL_LABEL,
  EDUCATION_LEVEL_LABEL,
  GENDER_LABEL,
  INCOME_RANGE_LABEL,
  LIVING_ARRANGEMENT_LABEL,
  PARENT_OCCUPATION_LABEL,
  PARENT_RELATIONSHIP_LABEL,
  RELIGION_LABEL,
  SPECIAL_NEEDS_LABEL,
  TRANSPORTATION_LABEL,
} from "@/modules/shared/constant/admission/registrationForm";

export function buildRegistrationFullForm(
  row: PpdbRegistrationFullRow,
  form: PpdbRegistrationFormRow,
  parents: RegistrationParentRow[],
  extras: Pick<FormBiodata, "details" | "achievements">,
  payment: RegistrationPaymentSummary,
): RegistrationFullFormResponse {
  const student = form.student;
  const contactRows = [
    toRow("Email", form.parent_email),
    toRow("No. HP", student.phone ?? form.contact_phone),
    toRow("Telepon rumah", student.home_phone),
  ];
  const contact: RegistrationFormSectionResponse[] = [
    { key: "contact", title: "Kontak", rows: contactRows },
  ];
  if (payment.payment_status) {
    contact.push(toPaymentSection(payment));
  }

  const fullForm: RegistrationFullFormResponse = {
    child: toChildSections(row, form, extras.details),
    parents: toParentForms(parents),
    contact,
    achievements: extras.achievements.map((achievement) => ({
      name: achievement.name,
      category: labelOf(ACHIEVEMENT_CATEGORY_LABEL, achievement.category) ?? "",
      level: labelOf(ACHIEVEMENT_LEVEL_LABEL, achievement.level) ?? "",
      year: achievement.year,
      organizer: achievement.organizer,
    })),
  };
  return fullForm;
}

function toChildSections(
  row: PpdbRegistrationFullRow,
  form: PpdbRegistrationFormRow,
  details: FormBiodata["details"],
): RegistrationFormSectionResponse[] {
  const student = form.student;
  const birthDate = student.date_of_birth
    ? formatDateOnly(String(student.date_of_birth))
    : null;
  const coordinates =
    student.latitude && student.longitude
      ? `${student.latitude}, ${student.longitude}`
      : null;
  const birthOrderRows = row.birth_order
    ? [toRow("Anak ke-", row.birth_order)]
    : [];

  const sections: RegistrationFormSectionResponse[] = [
    {
      key: "identity",
      title: "Identitas",
      rows: [
        toRow("Nama lengkap", student.full_name),
        toRow("NIK", student.nik),
        toRow("NISN", student.nisn),
        toRow("Jenis kelamin", labelOf(GENDER_LABEL, student.gender)),
        toRow(
          "Tempat, tanggal lahir",
          joinFilled([student.place_of_birth, birthDate]),
        ),
        toRow("Agama", labelOf(RELIGION_LABEL, student.religion)),
        toRow(
          "Berkebutuhan khusus",
          labelOf(SPECIAL_NEEDS_LABEL, student.physical_disability),
        ),
        toRow("No. akta lahir", student.birth_certificate_number),
        ...birthOrderRows,
      ],
    },
    {
      key: "address",
      title: "Alamat",
      rows: [
        toRow("Alamat", student.address),
        toRow("RT/RW", student.rt_rw),
        toRow("Dusun", student.hamlet),
        toRow("Kelurahan / desa", student.village),
        toRow("Kecamatan", student.district),
        toRow("Kota / kabupaten", student.city),
        toRow("Provinsi", student.province),
        toRow("Kode pos", student.postal_code),
        toRow("Lintang, bujur", coordinates),
        toRow(
          "Jenis tinggal",
          labelOf(LIVING_ARRANGEMENT_LABEL, details?.living_with),
        ),
        toRow(
          "Transportasi",
          labelOf(TRANSPORTATION_LABEL, details?.transportation_method),
        ),
      ],
    },
    {
      key: "previous_school",
      title: "Sekolah asal",
      rows: [
        toRow("Nama sekolah", student.previous_school),
        toRow("NPSN", student.previous_school_npsn),
        toRow("Alamat sekolah", student.previous_school_address),
      ],
    },
    {
      key: "periodic",
      title: "Data periodik",
      rows: [
        toRow("Tinggi badan", withUnit(details?.height, "cm")),
        toRow("Berat badan", withUnit(details?.weight, "kg")),
        toRow("Jarak ke sekolah", withUnit(details?.distance_km, "km")),
        toRow("Waktu tempuh", withUnit(details?.travel_time_minutes, "menit")),
        toRow("Saudara kandung", student.sibling_count),
      ],
    },
    {
      key: "social_aid",
      title: "Bantuan sosial",
      rows: [
        toRow("No. KKS", student.kks_number),
        toRow("No. KPS", student.kps_number),
        toRow("No. KIP", student.kip_number),
        toRow("Nama di KIP", student.kip_name),
      ],
    },
  ];
  return sections;
}

function toParentForms(
  parents: RegistrationParentRow[],
): RegistrationFormParentResponse[] {
  const titles = { father: "Ayah", mother: "Ibu", guardian: "Wali" } as const;
  const parentTypes = ["father", "mother", "guardian"] as const;

  const forms = parentTypes.map((key) => {
    const parent = parents.find((item) => item.parent_type === key);
    const income =
      labelOf(INCOME_RANGE_LABEL, parent?.income_range) ??
      (parent?.income ? formatRupiah(parent.income) : null);
    const birthDate = parent?.date_of_birth
      ? formatDateOnly(parent.date_of_birth)
      : null;
    const legacyBirth = joinFilled([parent?.place_of_birth, birthDate]);
    const birthRow = legacyBirth
      ? toRow("Tempat, tanggal lahir", legacyBirth)
      : toRow("Tahun lahir", parent?.birth_year);
    const statusRows = parent?.relationship_status
      ? [
          toRow(
            "Status",
            labelOf(PARENT_RELATIONSHIP_LABEL, parent.relationship_status),
          ),
        ]
      : [];
    const occupationRow = toRow(
      "Pekerjaan",
      labelOf(PARENT_OCCUPATION_LABEL, parent?.occupation),
    );
    const educationRow = toRow(
      "Pendidikan",
      labelOf(EDUCATION_LEVEL_LABEL, parent?.education),
    );

    const rows: RegistrationFormRowResponse[] =
      key === "guardian"
        ? [
            toRow("Nama", parent?.name),
            birthRow,
            occupationRow,
            educationRow,
            toRow("Penghasilan", income),
          ]
        : [
            toRow("Nama", parent?.name),
            toRow("NIK", parent?.nik),
            ...statusRows,
            birthRow,
            toRow(
              "Berkebutuhan khusus",
              labelOf(SPECIAL_NEEDS_LABEL, parent?.special_needs),
            ),
            occupationRow,
            educationRow,
            toRow("Penghasilan", income),
            toRow("WhatsApp", parent?.phone),
          ];
    const form: RegistrationFormParentResponse = {
      key,
      title: titles[key],
      rows: parent ? rows : null,
    };
    return form;
  });
  return forms;
}

function toPaymentSection(
  payment: RegistrationPaymentSummary,
): RegistrationFormSectionResponse {
  const statusLabels = {
    success: "Lunas",
    pending: "Belum dibayar",
    failed: "Gagal",
    expired: "Kedaluwarsa",
    cancelled: "Dibatalkan",
  };
  const paidAt = payment.paid_at
    ? new Intl.DateTimeFormat("id-ID", {
        timeZone: "Asia/Jakarta",
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(payment.paid_at))
    : null;
  const amount = payment.payment_amount
    ? formatRupiah(payment.payment_amount)
    : null;

  const section: RegistrationFormSectionResponse = {
    key: "payment",
    title: "Pembayaran",
    rows: [
      toRow(
        "Status",
        payment.payment_status && statusLabels[payment.payment_status],
      ),
      toRow("Nominal", amount),
      toRow("No. invoice", payment.invoice_number),
      toRow("Waktu bayar", paidAt),
    ],
  };
  return section;
}

function toRow(
  label: string,
  value: string | number | null | undefined,
): RegistrationFormRowResponse {
  const text = value === null || value === undefined ? "" : String(value);
  const row: RegistrationFormRowResponse = {
    label,
    value: text.trim() === "" ? null : text,
  };
  return row;
}

function labelOf(
  labels: Record<string, string>,
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  return labels[value] ?? value;
}

function joinFilled(parts: (string | null | undefined)[]): string | null {
  const filled = parts.filter((part) => part && part.trim() !== "");
  return filled.length > 0 ? filled.join(", ") : null;
}

function withUnit(
  value: number | null | undefined,
  unit: string,
): string | null {
  if (value === null || value === undefined) return null;
  return `${value} ${unit}`;
}

function formatDateOnly(date: string): string {
  const [year, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
