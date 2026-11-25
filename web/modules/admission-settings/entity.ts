export type LetterContact = {
  name: string;
  phone: string;
};

export type AdmissionSettingsRow = {
  tahfizh_yearly_fee: number;
  tahfizh_july_fee: number;
  unggulan_yearly_fee: number;
  unggulan_july_fee: number;
  darussalam_discount: number;
  other_discount: number;
  payment_deadline: string | null;
  bank_name: string;
  bank_account_number: string;
  bank_account_name: string;
  principal_name: string;
  committee_chair_name: string;
  director_name: string;
  pmb_contact_phone: string;
  letter_contacts: LetterContact[];
  updated_at: string;
};

export type SaveAdmissionSettingsInput = Omit<
  AdmissionSettingsRow,
  "updated_at" | "payment_deadline"
> & {
  payment_deadline: string;
  actorId: string;
};
