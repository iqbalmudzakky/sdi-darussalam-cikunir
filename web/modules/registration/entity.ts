import type { RegistrationPaymentSummary } from "@/modules/payment/entity";
import type {
  ReceivedDocument,
  REGISTRATION_PROGRAMS,
  REGISTRATION_STATUSES,
  REGISTRATION_TYPES,
} from "@/modules/shared/constant/registration";

export type PpdbRegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

export type RegistrationType = (typeof REGISTRATION_TYPES)[number];

export type RegistrationProgram = (typeof REGISTRATION_PROGRAMS)[number];

export type RegistrationSource = "online" | "offline";

export type Gender = "laki_laki" | "perempuan";

export type PhysicalDisability = "tidak_ada" | "ada";

export type ParentType = "father" | "mother";

export type ParentRelationshipStatus = "kandung" | "tiri" | "angkat" | "wali";

export type PpdbRegistration = {
  id: string;
  registration_type: RegistrationType;
  status: PpdbRegistrationStatus;
  source: RegistrationSource;
  academic_year: string | null;
  ip_address: string | null;
  parent_email: string | null;
  registration_number: string | null;
  program: RegistrationProgram | null;
  target_grade: number | null;
  contact_name: string | null;
  contact_phone: string | null;
  full_form_completed_at: string | null;
  received_documents: ReceivedDocument[];
  status_before_cancel: PpdbRegistrationStatus | null;
  created_at: string;
  updated_at: string;
};

export type PpdbRegistrationStudent = {
  id: string;

  registration_id: string;

  full_name: string;

  nickname: string | null;

  nik: string | null;

  nisn: string | null;

  gender: Gender;

  place_of_birth: string | null;

  date_of_birth: string;

  address: string | null;

  village: string | null;

  rt_rw: string | null;

  district: string | null;

  city: string | null;

  province: string | null;

  phone: string | null;

  birth_order: number | null;

  sibling_count: number | null;

  orphan_status: string | null;

  daily_language: string | null;

  citizenship: string;

  religion: string | null;

  physical_disability: PhysicalDisability | null;

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
  place_of_birth: string | null;
  date_of_birth: string;
  birth_order: number | null;
  sibling_count: number | null;
  physical_disability: PhysicalDisability | null;
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

export type PpdbRegistrationListItem = {
  id: string;
  registration_number: string | null;
  registration_type: RegistrationType;
  program: RegistrationProgram | null;
  target_grade: number | null;
  academic_year: string | null;
  status: PpdbRegistrationStatus;
  contact_name: string | null;
  contact_phone: string | null;
  full_form_completed_at: string | null;
  received_documents: ReceivedDocument[];
  created_at: string;
  full_name: string;
};

export type PpdbRegistrationFullRow = PpdbRegistrationOverviewBase &
  PpdbRegistrationListItem & {
    ip_address: string | null;
    student_nik: string | null;
    current_address: string | null;
  };

export type PpdbRegistrationExportRow = PpdbRegistrationOverviewBase & {
  nik: string | null;
  address: string | null;
};

export type PpdbRegistrationExportItem = PpdbRegistrationExportRow &
  RegistrationPaymentSummary;

export type RegistrationFilter = {
  search: string;
  statuses: PpdbRegistrationStatus[];
  academicYear: string;
  program: RegistrationProgram | "";
  registrationType: RegistrationType | "";
};

export type ListRegistrationsInput = RegistrationFilter & {
  sortDirection: "asc" | "desc";
  limit: number;
  offset: number;
};

export type NewShortRegistration = {
  registrationType: RegistrationType;
  registrationNumber: string;
  academicYear: string;
  program: RegistrationProgram;
  targetGrade: number | null;
  contactName: string;
  contactPhone: string;
  parentEmail: string | null;
  ipAddress: string;
  fullName: string;
  gender: Gender;
  dateOfBirth: string;
  previousSchool: string;
};

export type ShortRegistrationIdentity = {
  fullName: string;
  dateOfBirth: string;
  academicYear: string;
};

export type InsertFullRegistrationInput = {
  source: RegistrationSource;
  academicYear: string | null;
  registrationNumber: string | null;
};

export type RegistrantRegionRow = {
  city: string;
  province: string;
  total: number;
};

export type RegistrationSourceCounts = {
  online: number;
  offline_recorded: number;
};
