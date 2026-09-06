export type PaymentSettings = {
  /** Amount charged to the applicant, in IDR without decimals. */
  registration_fee: number;
  registration_opens_on: string | null;
  registration_closes_on: string | null;
  updated_at: string;
};

export type PaymentSettingsUpdateInput = {
  registrationFee: number;
  registrationOpensOn: string | null;
  registrationClosesOn: string | null;
};
