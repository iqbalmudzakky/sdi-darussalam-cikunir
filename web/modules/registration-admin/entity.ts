import type { ScheduleViewResponse } from "@/modules/admission-test/dto";
import type { ObservationSummaryResponse } from "@/modules/observation/dto";
import type { PaymentViewResponse } from "@/modules/payment/dto";
import type { RegistrationFullFormResponse } from "./dto";

export type TestStatus = ObservationSummaryResponse["state"];

export type RegistrationDetailParts = {
  fullForm: RegistrationFullFormResponse | null;
  scheduleView: ScheduleViewResponse;
  paymentView: PaymentViewResponse;
  observation: ObservationSummaryResponse | null;
  testStatus: TestStatus;
  canStartTest: boolean;
  canEditTest: boolean;
};
