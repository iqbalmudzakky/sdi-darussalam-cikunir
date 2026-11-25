import type { AdmissionProgressResponse } from "@/modules/admission-decision/dto";
import type { ScheduleViewResponse } from "@/modules/admission-test/dto";
import type { ObservationSummaryResponse } from "@/modules/observation/dto";
import type { PaymentViewResponse } from "@/modules/payment/dto";
import type { RegistrationFullFormResponse } from "./dto";

export type RegistrationDetailParts = {
  fullForm: RegistrationFullFormResponse | null;
  scheduleView: ScheduleViewResponse;
  paymentView: PaymentViewResponse;
  observation: ObservationSummaryResponse | null;
  progress: AdmissionProgressResponse;
};
