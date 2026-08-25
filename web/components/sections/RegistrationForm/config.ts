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
  parent_email: "",

  // Student
  full_name: "",
  nickname: "",
  student_nik: "",
  nisn: "",
  gender: "",
  place_of_birth: "",
  date_of_birth: "",

  current_address: "",
  village: "",
  rt_rw: "",
  district: "",
  city: "",
  province: "",

  /*
   * Kode wilayah dari wilayah.id. Hanya dipakai untuk merantai pilihan
   * (provinsi -> kabupaten -> kecamatan -> kelurahan); yang dikirim ke
   * server tetap namanya, karena itu yang dicetak di berkas.
   */
  province_code: "",
  city_code: "",
  district_code: "",

  student_phone: "",

  birth_order: "",
  sibling_count: "",

  orphan_status: "",
  daily_language: "",

  citizenship: "Indonesia",
  religion: "",

  physical_disability: "",

  previous_school: "",
  previous_school_transfer: "",

  // Father
  father_status: "",
  father_name: "",
  father_nik: "",
  father_place_of_birth: "",
  father_date_of_birth: "",
  father_religion: "",
  father_education: "",
  father_occupation: "",
  father_position: "",
  father_income: "",
  father_citizenship: "Indonesia",
  father_phone: "",

  // Mother
  mother_status: "",
  mother_name: "",
  mother_nik: "",
  mother_place_of_birth: "",
  mother_date_of_birth: "",
  mother_religion: "",
  mother_education: "",
  mother_occupation: "",
  mother_position: "",
  mother_income: "",
  mother_citizenship: "Indonesia",
  mother_phone: "",

  // Other information
  living_with: "",
  distance_to_school: "",
  owned_vehicle: "",
  transportation_method: "",
  talent: "",
  blood_type: "",
  height: "",
  weight: "",
  head_circumference: "",

  website: "",
};

export type FormFields = typeof EMPTY_FORM;

export type FieldName = keyof Omit<
  FormFields,
  "website" | "province_code" | "city_code" | "district_code"
>;

export type FieldErrors = Partial<Record<FieldName, string>>;

export const FIELD_LABELS: Record<FieldName, string> = {
  registration_type: "Jenis pendaftaran",

  parent_email: "Email orang tua",

  full_name: "Nama lengkap siswa",
  nickname: "Nama panggilan",
  student_nik: "NIK anak",
  nisn: "NISN",
  gender: "Jenis kelamin",

  place_of_birth: "Tempat lahir",
  date_of_birth: "Tanggal lahir",

  current_address: "Detail alamat",
  village: "Kelurahan",
  rt_rw: "RT/RW",
  district: "Kecamatan",
  city: "Kabupaten/Kota",
  province: "Provinsi",

  student_phone: "Nomor telepon",

  birth_order: "Anak ke-",
  sibling_count: "Jumlah saudara",

  orphan_status: "Status yatim/piatu",
  daily_language: "Bahasa sehari-hari",

  citizenship: "Warga negara",
  religion: "Agama",

  physical_disability: "Kelainan jasmani",

  previous_school: "Asal sekolah",
  previous_school_transfer: "Pindahan dari sekolah",

  father_status: "Status ayah",
  father_name: "Nama ayah",
  father_nik: "NIK ayah",
  father_place_of_birth: "Tempat lahir ayah",
  father_date_of_birth: "Tanggal lahir ayah",
  father_religion: "Agama ayah",
  father_education: "Pendidikan ayah",
  father_occupation: "Pekerjaan ayah",
  father_position: "Jabatan ayah",
  father_income: "Penghasilan ayah",
  father_citizenship: "Warga negara ayah",
  father_phone: "Nomor HP ayah",

  mother_status: "Status ibu",
  mother_name: "Nama ibu",
  mother_nik: "NIK ibu",
  mother_place_of_birth: "Tempat lahir ibu",
  mother_date_of_birth: "Tanggal lahir ibu",
  mother_religion: "Agama ibu",
  mother_education: "Pendidikan ibu",
  mother_occupation: "Pekerjaan ibu",
  mother_position: "Jabatan ibu",
  mother_income: "Penghasilan ibu",
  mother_citizenship: "Warga negara ibu",
  mother_phone: "Nomor HP ibu",

  living_with: "Tinggal bersama",
  distance_to_school: "Jarak rumah ke sekolah",
  owned_vehicle: "Kendaraan yang dimiliki",
  transportation_method: "Transportasi ke sekolah",
  talent: "Bakat/minat yang menonjol",
  blood_type: "Golongan darah",
  height: "Tinggi badan",
  weight: "Berat badan",
  head_circumference: "Lingkar kepala",
};

const PERSON_NAME_PATTERN = /^[\p{L}][\p{L}\s'.-]*$/u;

const NIK_PATTERN = /^\d{16}$/;

const NON_NEGATIVE_INTEGER_PATTERN = /^\d+$/;

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

export function validateField(field: FieldName, value: string): string | undefined {
  const trimmed = value.trim();
  const label = FIELD_LABELS[field];

  switch (field) {
    case "full_name":
    case "father_name":
    case "mother_name": {
      if (!trimmed) return "Wajib diisi";

      if (trimmed.length < 3) {
        return `${label} minimal 3 karakter.`;
      }

      if (!PERSON_NAME_PATTERN.test(trimmed)) {
        return "Wajib diisi";
      }

      return undefined;
    }

    case "student_nik":
    case "father_nik":
    case "mother_nik": {
      if (!trimmed) return "Wajib diisi";

      if (!NIK_PATTERN.test(trimmed)) {
        return "NIK harus 16 digit angka.";
      }

      return undefined;
    }

    case "father_education":
    case "mother_education":
    case "father_occupation":
    case "mother_occupation":
    case "father_position":
    case "mother_position": {
      if (!trimmed) return "Wajib diisi";

      return undefined;
    }

    case "birth_order": {
      if (!trimmed) return "Wajib diisi";

      if (!POSITIVE_INTEGER_PATTERN.test(trimmed)) {
        return "Wajib diisi";
      }

      return undefined;
    }

    case "sibling_count":
    case "father_income":
    case "mother_income": {
      if (!trimmed) return "Wajib diisi";

      if (!NON_NEGATIVE_INTEGER_PATTERN.test(trimmed)) {
        return "Wajib diisi";
      }

      return undefined;
    }

    case "place_of_birth":
    case "father_place_of_birth":
    case "mother_place_of_birth": {
      if (!trimmed) return "Wajib diisi";

      return undefined;
    }

    case "date_of_birth":
    case "father_date_of_birth":
    case "mother_date_of_birth": {
      if (!trimmed) return "Wajib diisi";

      return undefined;
    }

    case "father_phone":
    case "mother_phone": {
      if (!trimmed) return "Wajib diisi";

      const normalized = normalizeWhatsappNumber(trimmed);

      if (!/^0\d{9,13}$/.test(normalized)) {
        return `${label} tidak valid.`;
      }

      return undefined;
    }

    case "current_address":
    case "village":
    case "rt_rw":
    case "district":
    case "city":
    case "province": {
      if (!trimmed) return "Wajib diisi";

      return undefined;
    }

    case "previous_school": {
      if (!trimmed) return "Wajib diisi";

      return undefined;
    }

    case "religion":
    case "father_religion":
    case "mother_religion": {
      if (!trimmed) {
        return "Wajib diisi";
      }

      return undefined;
    }
    case "registration_type":
    case "gender":
    case "physical_disability":
    case "father_status":
    case "mother_status": {
      if (!trimmed) {
        return "Wajib dipilih";
      }

      return undefined;
    }

    default:
      return undefined;
  }
}

export const REQUIRED_FIELDS: FieldName[] = [
  "registration_type",

  "full_name",
  "student_nik",
  "gender",
  "place_of_birth",
  "date_of_birth",
  "birth_order",
  "sibling_count",
  "current_address",
  "village",
  "rt_rw",
  "district",
  "city",
  "province",
  "physical_disability",
  "previous_school",

  "father_status",
  "father_name",
  "father_nik",
  "father_place_of_birth",
  "father_date_of_birth",
  "father_phone",
  "father_income",

  "mother_status",
  "mother_name",
  "mother_nik",
  "mother_place_of_birth",
  "mother_date_of_birth",
  "mother_phone",
  "mother_income",
];

export const PHONE_FIELDS: FieldName[] = ["father_phone", "mother_phone"];
