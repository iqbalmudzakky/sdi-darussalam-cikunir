export type RegistrationFormLink = {
  registration_id: string;
  expires_at: string;
};

export type NewRegistrationFormLink = {
  registrationId: string;
  tokenHash: string;
  expiresAt: Date;
  createdBy: string | null;
};
