import { REGISTRATION_FLOW_STEPS } from "@/modules/shared/constant/admission/registration";
import type { RegistrationFlowStepResponse } from "@/modules/registration-intake/dto";

export function buildFlowSteps(
  currentStep: { index: number; badge: string },
  registrationFee: number,
): RegistrationFlowStepResponse[] {
  const steps = REGISTRATION_FLOW_STEPS.map((step, index) => {
    const isCurrent = index === currentStep.index;
    const flowStep: RegistrationFlowStepResponse = {
      label: step.label,
      state:
        index < currentStep.index ? "done" : isCurrent ? "current" : "upcoming",
      badge: isCurrent ? currentStep.badge : null,
      fee: step.showsFee && index > currentStep.index ? registrationFee : null,
    };
    return flowStep;
  });
  return steps;
}
