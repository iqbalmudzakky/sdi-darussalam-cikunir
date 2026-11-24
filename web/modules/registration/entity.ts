import type { ManualStudentForm, StudentForm } from "./dto";
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

export type ParentRelationshipStatus = "kandung" | "tiri" | "angkat" | "wali";

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
  source: RegistrationSource;
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
  source: RegistrationSource;
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

export type UpdateRegistrationInfoInput = {
  registrationId: string;
  registrationType: RegistrationType;
  academicYear: string;
  registrationNumber: string | null;
  program: RegistrationProgram | null;
  targetGrade: number | null;
  contactName: string;
  contactPhone: string;
  receivedDocuments: ReceivedDocument[];
};

export type UpdateRegistrationFormInput = {
  registrationId: string;
  parentEmail: string | null;
  student: StudentForm | ManualStudentForm;
};

export type PpdbRegistrationFormRow = {
  id: string;
  registration_number: string | null;
  registration_type: RegistrationType;
  program: RegistrationProgram | null;
  target_grade: number | null;
  academic_year: string | null;
  parent_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  student: { [K in keyof StudentForm]: StudentForm[K] | null };
};

export type AdvanceStatusInput = {
  id: string;
  nextStatus: PpdbRegistrationStatus;
  fromStatuses: PpdbRegistrationStatus[];
};
