export function normalizeWhatsappNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");

  if (digitsOnly.startsWith("62")) {
    return `0${digitsOnly.slice(2)}`;
  }

  if (digitsOnly.startsWith("8")) {
    return `0${digitsOnly}`;
  }

  return digitsOnly;
}

export const EMPTY_FORM = {
  registration_type: "",
  full_name: "",
  gender: "",
  place_of_birth: "",
  date_of_birth: "",
  current_address: "",
  physical_disability: "",
  previous_school: "",
  nisn: "",
  father_status: "",
  father_name: "",
  father_place_of_birth: "",
  father_date_of_birth: "",
  father_phone: "",
  mother_status: "",
  mother_name: "",
  mother_place_of_birth: "",
  mother_date_of_birth: "",
  mother_phone: "",
  parent_email: "",
  website: "",
};

export type FormFields = typeof EMPTY_FORM;
export type FieldName = keyof Omit<FormFields, "website">;
export type FieldErrors = Partial<Record<FieldName, string>>;

export const FIELD_LABELS: Record<FieldName, string> = {
  registration_type: "Jenis pendaftaran",
  full_name: "Nama lengkap siswa",
  gender: "Jenis kelamin",
  place_of_birth: "Tempat lahir",
  date_of_birth: "Tanggal lahir",
  current_address: "Alamat sekarang",
  physical_disability: "Kelainan jasmani",
  previous_school: "Asal sekolah",
  nisn: "NISN",
  father_status: "Status ayah",
  father_name: "Nama ayah",
  father_place_of_birth: "Tempat lahir ayah",
  father_date_of_birth: "Tanggal lahir ayah",
  father_phone: "Nomor HP ayah",
  mother_status: "Status ibu",
  mother_name: "Nama ibu",
  mother_place_of_birth: "Tempat lahir ibu",
  mother_date_of_birth: "Tanggal lahir ibu",
  mother_phone: "Nomor HP ibu",
  parent_email: "Email",
};

const PERSON_NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateField(
  field: FieldName,
  value: string,
): string | undefined {
  const trimmed = value.trim();
  const label = FIELD_LABELS[field];

  switch (field) {
    case "full_name":
    case "father_name":
    case "mother_name": {
      if (!trimmed) return `${label} wajib diisi.`;
      if (trimmed.length < 3) return `${label} minimal 3 karakter.`;
      if (trimmed.length > 80) return `${label} maksimal 80 karakter.`;
      if (!PERSON_NAME_PATTERN.test(trimmed)) {
        return `${label} hanya boleh berisi huruf.`;
      }
      return undefined;
    }

    case "place_of_birth":
    case "father_place_of_birth":
    case "mother_place_of_birth": {
      if (!trimmed) return `${label} wajib diisi.`;
      if (trimmed.length > 80) return `${label} maksimal 80 karakter.`;
      return undefined;
    }

    case "date_of_birth":
    case "father_date_of_birth":
    case "mother_date_of_birth": {
      if (!trimmed) return `${label} wajib diisi.`;
      return undefined;
    }

    case "father_phone":
    case "mother_phone": {
      if (!trimmed) return `${label} wajib diisi.`;
      const normalized = normalizeWhatsappNumber(trimmed);
      if (!/^0\d{9,13}$/.test(normalized)) {
        return `${label} tidak valid. Contoh: 081234567890.`;
      }
      return undefined;
    }

    case "parent_email": {
      if (!trimmed) return "Email wajib diisi.";
      if (!EMAIL_PATTERN.test(trimmed)) return "Format email tidak valid.";
      return undefined;
    }

    case "current_address": {
      if (!trimmed) return `${label} wajib diisi.`;
      if (trimmed.length > 200) return `${label} maksimal 200 karakter.`;
      return undefined;
    }

    case "previous_school": {
      if (!trimmed) return `${label} wajib diisi.`;
      if (trimmed.length > 120) return `${label} maksimal 120 karakter.`;
      return undefined;
    }

    case "registration_type":
    case "gender":
    case "physical_disability":
    case "father_status":
    case "mother_status": {
      if (!trimmed) return `${label} wajib dipilih.`;
      return undefined;
    }

    case "nisn":
      return undefined;
  }
}

export const REQUIRED_FIELDS: FieldName[] = (
  Object.keys(FIELD_LABELS) as FieldName[]
).filter((field) => field !== "nisn");

export const PHONE_FIELDS: FieldName[] = ["father_phone", "mother_phone"];
