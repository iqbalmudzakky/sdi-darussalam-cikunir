export type RegistrationLinkKind = "form" | "documents";

export type RegistrationLink = {
  registration_id: string;
  expires_at: string;
};

export type NewRegistrationLink = {
  registrationId: string;
  kind: RegistrationLinkKind;
  tokenHash: string;
  expiresAt: Date;
  createdBy: string | null;
};

export type CreateLinkInput = {
  registrationId: string;
  kind: RegistrationLinkKind;
  createdBy: string | null;
};
