export const STATEMENT_PARENT_FIELDS = [
  { name: "name", label: "Nama" },
  { name: "nik", label: "No. KTP" },
  { name: "occupation", label: "Pekerjaan" },
  { name: "phone", label: "No. Telp. / HP" },
] as const;

export const STATEMENT_ADDRESS_FIELDS = [
  { name: "street", label: "Dusun / Jalan" },
  { name: "rt", label: "RT" },
  { name: "rw", label: "RW" },
  { name: "village", label: "Kelurahan" },
  { name: "postal_code", label: "Kode Pos" },
  { name: "district", label: "Kecamatan" },
  { name: "city", label: "Kab/Kota" },
  { name: "province", label: "Provinsi" },
] as const;

export const STATEMENT_CHILD_FIELDS = [
  { name: "full_name", label: "Nama lengkap anak" },
  { name: "place_of_birth", label: "Tempat lahir" },
  { name: "grade_label", label: "Kelas" },
  { name: "academic_year", label: "Tahun Pelajaran" },
] as const;

export const MOTHER_ADDRESS_OPTIONS = [
  { value: "same", label: "Sama dengan Bapak" },
  { value: "other", label: "Alamat lain" },
];
