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
