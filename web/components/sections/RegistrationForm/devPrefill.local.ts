import type { FormFields } from "./config";

// Isi lokal buat auto-prefill form pas testing manual. Jangan commit isinya.
//
// Kode wilayah (province_code/city_code) pakai kode Kemendagri Jawa
// Barat/Kota Bekasi yang cukup pasti; district/village sengaja tanpa kode
// karena butuh lookup langsung ke wilayah.id — kalau namanya tidak persis
// cocok dengan data yang termuat, tinggal pilih ulang dua dropdown itu saja.
export const DEV_PREFILL: Partial<FormFields> = {};

// export const DEV_PREFILL: Partial<FormFields> = {
//   registration_type: "siswa_baru",
//   parent_email: "orangtua.test@example.com",

//   full_name: "Ahmad Dzakky B",
//   nickname: "Dzakky B",
//   student_nik: "3275042107980039",
//   nisn: "0123456791",
//   gender: "laki_laki",
//   place_of_birth: "Bekasi",
//   date_of_birth: "2019-05-14",

//   current_address: "Jl. Cikunir Raya No. 12",
//   village: "Jatibening",
//   rt_rw: "003/005",
//   district: "Pondok Gede",
//   city: "Kota Bekasi",
//   province: "Jawa Barat",
//   province_code: "32",
//   city_code: "32.75",
//   district_code: "",

//   student_phone: "",

//   birth_order: "1",
//   sibling_count: "1",

//   orphan_status: "Tidak",
//   daily_language: "Indonesia",

//   citizenship: "Indonesia",
//   religion: "Islam",

//   physical_disability: "tidak_ada",

//   previous_school: "TK Islam Darussalam",
//   previous_school_transfer: "",

//   father_status: "kandung",
//   father_name: "Budi Santoso Test",
//   father_nik: "3275010101850001",
//   father_place_of_birth: "Bekasi",
//   father_date_of_birth: "1985-03-20",
//   father_religion: "Islam",
//   father_education: "S1",
//   father_occupation: "Karyawan Swasta",
//   father_position: "Staff",
//   father_income: "5000000",
//   father_citizenship: "Indonesia",
//   father_phone: "081234567890",

//   mother_status: "kandung",
//   mother_name: "Siti Aminah Test",
//   mother_nik: "3275010101880001",
//   mother_place_of_birth: "Bekasi",
//   mother_date_of_birth: "1988-07-11",
//   mother_religion: "Islam",
//   mother_education: "S1",
//   mother_occupation: "Ibu Rumah Tangga",
//   mother_position: "-",
//   mother_income: "0",
//   mother_citizenship: "Indonesia",
//   mother_phone: "081298765432",

//   living_with: "Orang tua kandung",
//   distance_to_school: "2",
//   owned_vehicle: "Motor",
//   transportation_method: "Diantar",
//   talent: "Menggambar",
//   blood_type: "O",
//   height: "110",
//   weight: "18",
//   head_circumference: "48",
// };
