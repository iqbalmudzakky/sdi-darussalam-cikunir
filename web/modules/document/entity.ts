export type DocumentLink = {
  registration_id: string;
  expires_at: string;
};

export type NewDocumentLink = {
  registrationId: string;
  tokenHash: string;
  expiresAt: Date;
  createdBy: string;
};
