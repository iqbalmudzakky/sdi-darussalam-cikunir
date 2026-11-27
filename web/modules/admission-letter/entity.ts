export type StatementAddress = {
  street: string;
  rt: string;
  rw: string;
  village: string;
  postal_code: string;
  district: string;
  city: string;
  province: string;
};

export type StatementParent = {
  name: string;
  nik: string;
  occupation: string;
  phone: string;
  address: StatementAddress;
};

export type StatementFees = {
  tahfizh_yearly_fee: number;
  tahfizh_july_fee: number;
  unggulan_yearly_fee: number;
  unggulan_july_fee: number;
  darussalam_discount: number;
  other_discount: number;
  payment_deadline: string | null;
};

export type StatementContent = {
  letter_date: string;
  father: StatementParent;
  mother: StatementParent & { same_address: boolean };
  child: {
    full_name: string;
    place_of_birth: string;
    date_of_birth: string;
    grade_label: string;
    academic_year: string;
  };
  fees: StatementFees;
  signers: {
    principal_name: string;
    director_name: string;
  };
};

export type StatementRow = {
  registration_id: string;
  content: StatementContent;
};

export type SaveStatementInput = {
  registrationId: string;
  content: StatementContent;
  actorId: string;
};

export type DecisionLetterContact = {
  name: string;
  phone: string;
};

export type DecisionLetterContent = {
  letter_number: string;
  letter_date: string;
  entry_year: string;
  child: {
    full_name: string;
    previous_school: string;
    grade_label: string;
    age_label: string;
  };
  payment: {
    deadline: string;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
  };
  signers: {
    principal_name: string;
    committee_chair_name: string;
  };
  contacts: DecisionLetterContact[];
};

export type DecisionLetterRow = {
  registration_id: string;
  content: DecisionLetterContent;
};

export type SaveDecisionLetterInput = {
  registrationId: string;
  content: DecisionLetterContent;
  letterYear: number;
  letterSequence: number | null;
  actorId: string;
};

export type LetterSequenceInput = {
  registrationId: string;
  letterYear: number;
  letterSequence: number;
};
