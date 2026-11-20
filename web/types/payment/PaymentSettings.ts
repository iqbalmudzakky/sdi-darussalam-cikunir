export type DokuEstimate = {
  method: string;
  deduction: number;
  received: number;
};

export type PaymentSettingsResponse = {
  registration_fee: number;
  registration_opens_on: string | null;
  registration_closes_on: string | null;
  updated_at: string;
  doku_estimates: DokuEstimate[];
  can_manage: boolean;
};
