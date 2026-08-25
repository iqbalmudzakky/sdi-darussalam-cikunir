import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";

export type PaymentStatus = "pending" | "success" | "failed" | "expired";

/**
 * The validated biodata held in `payload` until the payment succeeds. It is the
 * same shape the registration API accepts, minus ip_address — that is recorded
 * on the payment row and copied across when the registration is created.
 */
export type RegistrationPayload = Omit<
  CreatePpdbRegistrationRequest,
  "ip_address"
>;

export type RegistrationPayment = {
  id: string;
  invoice_number: string;
  amount: number;
  status: PaymentStatus;
  payload: RegistrationPayload;
  registration_id: string | null;
  session_id: string | null;
  token_id: string | null;
  payment_url: string | null;
  expired_date: string | null;
  payment_method: string | null;
  acquirer: string | null;
  paid_at: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
};

export type NewRegistrationPayment = {
  invoice_number: string;
  amount: number;
  payload: RegistrationPayload;
  ip_address: string | null;
};

/**
 * The subset of DOKU's HTTP Notification body we act on. Parsed non-strictly —
 * DOKU may add fields at any time and the guide asks clients to ignore them.
 */
export type DokuNotification = {
  service?: { id?: string };
  acquirer?: { id?: string };
  channel?: { id?: string };
  transaction?: {
    status?: string;
    date?: string;
    original_request_id?: string;
  };
  order?: {
    invoice_number?: string;
    amount?: number | string;
  };
};
