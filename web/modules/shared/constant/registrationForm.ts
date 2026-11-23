export const PARENT_OCCUPATION_LABEL = {
  not_working: "Tidak bekerja",
  fisherman: "Nelayan",
  farmer: "Petani",
  rancher: "Peternak",
  civil_servant: "PNS/TNI/Polri",
  private_employee: "Karyawan swasta",
  state_employee: "Karyawan BUMN",
  small_trader: "Pedagang kecil",
  large_trader: "Pedagang besar",
  self_employed: "Wiraswasta",
  entrepreneur: "Wirausaha",
  laborer: "Buruh",
  retired: "Pensiunan",
  migrant_worker: "Tenaga kerja Indonesia",
  deceased: "Sudah meninggal",
  other: "Lainnya",
} as const;

export const EDUCATION_LEVEL_LABEL = {
  none: "Tidak sekolah",
  elementary: "SD sederajat",
  junior_high: "SMP sederajat",
  senior_high: "SMA sederajat",
  diploma_1: "D1",
  diploma_2: "D2",
  diploma_3: "D3",
  bachelor: "D4/S1",
  master: "S2",
  doctorate: "S3",
} as const;

export const INCOME_RANGE_LABEL = {
  none: "Tidak berpenghasilan",
  below_500k: "< Rp 500.000",
  from_500k: "Rp 500.000 – 999.999",
  from_1m: "Rp 1 juta – 1.999.999",
  from_2m: "Rp 2 juta – 4.999.999",
  from_5m: "Rp 5 juta – 20 juta",
  above_20m: "> Rp 20 juta",
} as const;

export const TRANSPORTATION_LABEL = {
  walking: "Jalan kaki",
  private_vehicle: "Kendaraan pribadi",
  public_transport: "Kendaraan umum/angkot",
  school_shuttle: "Jemputan sekolah",
  train: "Kereta api",
  motorcycle_taxi: "Ojek",
  other: "Lainnya",
} as const;

export const LIVING_ARRANGEMENT_LABEL = {
  parents: "Bersama orang tua",
  guardian: "Bersama wali",
  boarding: "Kos",
  dormitory: "Asrama",
  orphanage: "Panti asuhan",
  islamic_boarding: "Pesantren",
  other: "Lainnya",
} as const;

export const ACHIEVEMENT_CATEGORY_LABEL = {
  science: "Sains",
  arts: "Seni",
  sports: "Olahraga",
  other: "Lainnya",
} as const;

export const ACHIEVEMENT_LEVEL_LABEL = {
  school: "Sekolah",
  district: "Kecamatan",
  city: "Kabupaten/Kota",
  province: "Provinsi",
  national: "Nasional",
  international: "Internasional",
} as const;

export const RELIGION_LABEL = {
  islam: "Islam",
  kristen: "Kristen",
  katolik: "Katolik",
  hindu: "Hindu",
  buddha: "Buddha",
  konghucu: "Konghucu",
} as const;

export const SPECIAL_NEEDS_LABEL = {
  tidak_ada: "Tidak ada",
  ada: "Ada",
} as const;

export const MAX_ACHIEVEMENTS = 10;
export const MIN_PARENT_BIRTH_YEAR = 1940;
export const MAX_DISTANCE_KM = 100;
export const MAX_TRAVEL_TIME_MINUTES = 300;
