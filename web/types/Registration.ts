import type {
  Registration,
  RegistrationStatus,
} from "@/modules/registration/entity";

export type { Registration, RegistrationStatus };

export type SubmitRegistrationInput = {
  parent_name: string;
  student_name: string;
  whatsapp: string;
  email: string;
  message: string;
  website?: string;
};

export type UpdateRegistrationStatusInput = {
  status: RegistrationStatus;
};
