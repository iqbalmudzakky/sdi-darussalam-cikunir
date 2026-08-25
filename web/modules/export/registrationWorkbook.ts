import ExcelJS from "exceljs";
import type { PpdbRegistrationExportItem } from "@/modules/registration/entity";

const REGISTRATION_TYPE_LABELS: Record<string, string> = {
  siswa_baru: "Siswa Baru",
  pindahan: "Pindahan",
};

const GENDER_LABELS: Record<string, string> = {
  laki_laki: "Laki-laki",
  perempuan: "Perempuan",
};

const PHYSICAL_DISABILITY_LABELS: Record<string, string> = {
  tidak_ada: "Tidak Ada",
  ada: "Ada",
};

const PARENT_RELATIONSHIP_LABELS: Record<string, string> = {
  kandung: "Kandung",
  tiri: "Tiri",
  angkat: "Angkat",
  wali: "Wali",
};

const STATUS_LABELS = {
  pending: "Belum",
  in_progress: "Proses",
  not_registered: "Tidak Jadi Daftar",
  registered: "Sudah Daftar",
} as const;

function formatDateOnly(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getRegistrationsExportFilename(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `data-pendaftar-${year}-${month}-${day}.xlsx`;
}

export async function buildRegistrationsWorkbookBuffer(
  registrations: PpdbRegistrationExportItem[],
): Promise<ExcelJS.Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SD Islam Darussalam Cikunir";
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Pendaftar");

  worksheet.columns = [
    { header: "No.", key: "number", width: 7 },
    { header: "Tanggal Pendaftaran", key: "created_at", width: 22 },
    { header: "Status", key: "status", width: 14 },
    { header: "Jenis Pendaftaran", key: "registration_type", width: 20 },
    { header: "Nama Lengkap Siswa", key: "full_name", width: 30 },
    { header: "NIK Anak", key: "student_nik", width: 20 },
    { header: "Jenis Kelamin", key: "gender", width: 16 },
    { header: "Tempat Lahir Siswa", key: "place_of_birth", width: 22 },
    { header: "Tanggal Lahir Siswa", key: "date_of_birth", width: 20 },
    { header: "Anak ke-", key: "birth_order", width: 12 },
    { header: "Jumlah Saudara", key: "sibling_count", width: 16 },
    { header: "Alamat Sekarang", key: "current_address", width: 40 },
    { header: "Kelainan Jasmani", key: "physical_disability", width: 20 },
    { header: "Asal Sekolah", key: "previous_school", width: 28 },
    { header: "NISN", key: "nisn", width: 18 },
    { header: "Status Ayah", key: "father_status", width: 16 },
    { header: "Nama Ayah", key: "father_name", width: 28 },
    { header: "NIK Ayah", key: "father_nik", width: 20 },
    { header: "Tempat Lahir Ayah", key: "father_place_of_birth", width: 22 },
    { header: "Tanggal Lahir Ayah", key: "father_date_of_birth", width: 20 },
    { header: "No. HP Ayah", key: "father_phone", width: 18 },
    { header: "Penghasilan Ayah (Rp)", key: "father_income", width: 22 },
    { header: "Status Ibu", key: "mother_status", width: 16 },
    { header: "Nama Ibu", key: "mother_name", width: 28 },
    { header: "NIK Ibu", key: "mother_nik", width: 20 },
    { header: "Tempat Lahir Ibu", key: "mother_place_of_birth", width: 22 },
    { header: "Tanggal Lahir Ibu", key: "mother_date_of_birth", width: 20 },
    { header: "No. HP Ibu", key: "mother_phone", width: 18 },
    { header: "Penghasilan Ibu (Rp)", key: "mother_income", width: 22 },
    { header: "Email Orang Tua", key: "parent_email", width: 30 },
  ];

  registrations.forEach((registration, index) => {
    worksheet.addRow({
      number: index + 1,
      created_at: formatDateTime(registration.created_at),
      status: STATUS_LABELS[registration.status],
      registration_type:
        REGISTRATION_TYPE_LABELS[registration.registration_type] ??
        registration.registration_type,
      full_name: registration.full_name,
      student_nik: registration.nik,
      gender: GENDER_LABELS[registration.gender] ?? registration.gender,
      place_of_birth: registration.place_of_birth,
      date_of_birth: formatDateOnly(registration.date_of_birth),
      birth_order: registration.birth_order,
      sibling_count: registration.sibling_count,
      current_address: registration.address,
      physical_disability:
        PHYSICAL_DISABILITY_LABELS[registration.physical_disability] ??
        registration.physical_disability,
      previous_school: registration.previous_school,
      nisn: registration.nisn ?? "",
      father_status: registration.father_status
        ? (PARENT_RELATIONSHIP_LABELS[registration.father_status] ??
          registration.father_status)
        : "",
      father_name: registration.father_name,
      father_nik: registration.father_nik,
      father_place_of_birth: registration.father_place_of_birth,
      father_date_of_birth: registration.father_date_of_birth
        ? formatDateOnly(registration.father_date_of_birth)
        : "",
      father_phone: registration.father_phone,
      father_income: registration.father_income,
      mother_status: registration.mother_status
        ? (PARENT_RELATIONSHIP_LABELS[registration.mother_status] ??
          registration.mother_status)
        : "",
      mother_name: registration.mother_name,
      mother_nik: registration.mother_nik,
      mother_place_of_birth: registration.mother_place_of_birth,
      mother_date_of_birth: registration.mother_date_of_birth
        ? formatDateOnly(registration.mother_date_of_birth)
        : "",
      mother_phone: registration.mother_phone,
      mother_income: registration.mother_income,
      parent_email: registration.parent_email ?? "",
    });
  });

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle", wrapText: true };
  headerRow.height = 30;

  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.autoFilter = { from: "A1", to: "AD1" };

  worksheet.getColumn("student_nik").numFmt = "@";
  worksheet.getColumn("nisn").numFmt = "@";
  worksheet.getColumn("father_nik").numFmt = "@";
  worksheet.getColumn("father_phone").numFmt = "@";
  worksheet.getColumn("mother_nik").numFmt = "@";
  worksheet.getColumn("mother_phone").numFmt = "@";

  worksheet.getColumn("father_income").numFmt = "#,##0";
  worksheet.getColumn("mother_income").numFmt = "#,##0";

  return workbook.xlsx.writeBuffer();
}
