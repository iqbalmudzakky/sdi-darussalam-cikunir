export type ParentType = "father" | "mother" | "guardian";

export type RegistrationParentRow = {
  registration_id: string;
  parent_type: ParentType;
  name: string;
  nik: string | null;
  birth_year: number | null;
  special_needs: string | null;
  occupation: string | null;
  education: string | null;
  income_range: string | null;
  phone: string | null;
  relationship_status: string | null;
  place_of_birth: string | null;
  date_of_birth: string | null;
  income: number | null;
};

export type ParentFormRow = {
  parent_type: ParentType;
  name: string;
  nik: string | null;
  birth_year: number | null;
  special_needs: string | null;
  occupation: string | null;
  education: string | null;
  income_range: string | null;
  phone: string | null;
};

export type DetailsFormRow = {
  living_with: string | null;
  transportation_method: string | null;
  height: number | null;
  weight: number | null;
  distance_km: number | null;
  travel_time_minutes: number | null;
};

export type AchievementRow = {
  category: string;
  level: string;
  name: string;
  year: number;
  organizer: string | null;
};

export type FormBiodata = {
  father: ParentFormRow | null;
  mother: ParentFormRow | null;
  guardian: ParentFormRow | null;
  details: DetailsFormRow | null;
  achievements: AchievementRow[];
};
