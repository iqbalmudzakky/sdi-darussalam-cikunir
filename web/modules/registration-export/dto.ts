import { z } from "zod";
import type { RegistrationPaymentSummary } from "@/modules/payment/entity";
import type {
  ParentRelationshipStatus,
  PpdbRegistrationExportRow,
} from "@/modules/registration/entity";
import { REGISTRATION_STATUSES } from "@/modules/shared/constant/admission/registration";

export const ExportRegistrationsQuerySchema = z.object({
  statuses: z.array(z.enum(REGISTRATION_STATUSES)).default([]),
});

export type ExportRegistrationsQuery = z.infer<
  typeof ExportRegistrationsQuerySchema
>;

export type RegistrationParentColumns = {
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

export type RegistrationExportItem = PpdbRegistrationExportRow &
  RegistrationParentColumns &
  RegistrationPaymentSummary;
