export type PpdbRegistrationStatus =
  | "pending"
  | "in_progress"
  | "not_registered"
  | "registered";

export type RegistrationType = "siswa_baru" | "pindahan";

export type Gender = "laki_laki" | "perempuan";

export type PhysicalDisability = "tidak_ada" | "ada";

export type ParentType = "father" | "mother";

export type ParentRelationshipStatus = "kandung" | "tiri" | "angkat" | "wali";

export type PpdbRegistration = {
  id: string;

  registration_type: RegistrationType;

  status: PpdbRegistrationStatus;

  ip_address: string | null;

  parent_email: string | null;

  created_at: string;

  updated_at: string;
};

export type PpdbRegistrationStudent = {
  id: string;

  registration_id: string;

  full_name: string;

  nickname: string | null;

  nik: string;

  nisn: string | null;

  gender: Gender;

  place_of_birth: string;

  date_of_birth: string;

  address: string;

  village: string | null;

  rt_rw: string | null;

  district: string | null;

  city: string | null;

  province: string | null;

  phone: string | null;

  birth_order: number;

  sibling_count: number;

  orphan_status: string | null;

  daily_language: string | null;

  citizenship: string;

  religion: string;

  physical_disability: PhysicalDisability;

  previous_school: string;

  previous_school_transfer: string | null;

  created_at: string;

  updated_at: string;
};

export type PpdbRegistrationParent = {
  id: string;

  registration_id: string;

  parent_type: ParentType;

  relationship_status: ParentRelationshipStatus;

  name: string;

  nik: string;

  place_of_birth: string;

  date_of_birth: string;

  religion: string | null;

  education: string | null;

  occupation: string | null;

  position: string | null;

  income: number | null;

  citizenship: string | null;

  phone: string;

  created_at: string;

  updated_at: string;
};

export type PpdbRegistrationDetail = {
  id: string;

  registration_id: string;

  living_with: string | null;

  distance_to_school: string | null;

  owned_vehicle: string | null;

  transportation_method: string | null;

  talent: string | null;

  blood_type: string | null;

  height: number | null;

  weight: number | null;

  head_circumference: number | null;

  created_at: string;

  updated_at: string;
};

export type NewPpdbRegistration = Omit<
  PpdbRegistration,
  "id" | "created_at" | "updated_at"
>;

export type NewPpdbRegistrationStudent = Omit<
  PpdbRegistrationStudent,
  "id" | "created_at" | "updated_at"
>;

export type NewPpdbRegistrationParent = Omit<
  PpdbRegistrationParent,
  "id" | "created_at" | "updated_at"
>;

export type NewPpdbRegistrationDetail = Omit<
  PpdbRegistrationDetail,
  "id" | "created_at" | "updated_at"
>;

type PpdbRegistrationOverviewBase = {
  id: string;
  registration_type: RegistrationType;
  status: PpdbRegistrationStatus;
  parent_email: string | null;
  created_at: string;

  full_name: string;
  nisn: string | null;
  gender: Gender;
  place_of_birth: string;
  date_of_birth: string;
  birth_order: number;
  sibling_count: number;
  physical_disability: PhysicalDisability;
  previous_school: string;

  father_status: ParentRelationshipStatus | null;
  father_name: string | null;
  father_nik: string | null;
  father_place_of_birth: string | null;
  father_date_of_birth: string | null;
  father_phone: string | null;
  father_income: number | null;

  mother_status: ParentRelationshipStatus | null;
  mother_name: string | null;
  mother_nik: string | null;
  mother_place_of_birth: string | null;
  mother_date_of_birth: string | null;
  mother_phone: string | null;
  mother_income: number | null;
};

export type PpdbRegistrationListItem = PpdbRegistrationOverviewBase & {
  ip_address: string | null;
  student_nik: string;
  current_address: string;
};

export type PpdbRegistrationExportItem = PpdbRegistrationOverviewBase & {
  nik: string;
  address: string;
};
