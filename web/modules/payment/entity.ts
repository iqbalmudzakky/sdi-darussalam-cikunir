import type { CreatePpdbRegistrationRequest } from "@/modules/registration/dto";

export type PaymentStatus = "pending" | "success" | "failed" | "expired";

export type PaymentSource = "online" | "manual";

export type ManualPaymentMethod = "CASH" | "TRANSFER";

/* Biodata tervalidasi, ditahan sampai pembayaran berhasil. */
export type RegistrationPayload = Omit<
  CreatePpdbRegistrationRequest,
  "ip_address"
>;

export type RegistrationPayment = {
  id: string;
  invoice_number: string;
  amount: number;
  status: PaymentStatus;
  source: PaymentSource;
  payload: RegistrationPayload;
  registration_id: string | null;
  session_id: string | null;
  token_id: string | null;
  payment_url: string | null;
  expired_date: string | null;
  payment_method: string | null;
  acquirer: string | null;
  receipt_number: string | null;
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

export type NewManualPayment = {
  invoiceNumber: string;
  amount: number;
  payload: RegistrationPayload;
  ipAddress: string | null;
  paymentMethod: ManualPaymentMethod;
  receiptNumber: string | null;
  paidAt: string;
};

export type PaymentFilter = {
  search: string;
  statuses: PaymentStatus[];
};

export type ListPaymentsInput = PaymentFilter & {
  sortDirection: "asc" | "desc";
  limit: number;
  offset: number;
};

export type RegistrationPaymentListItem = {
  id: string;
  invoice_number: string;
  amount: number;
  status: PaymentStatus;
  source: PaymentSource;
  registration_id: string | null;
  payment_method: string | null;
  acquirer: string | null;
  receipt_number: string | null;
  paid_at: string | null;
  expired_date: string | null;
  created_at: string;

  full_name: string | null;
  student_nik: string | null;
  parent_email: string | null;
  father_phone: string | null;
  mother_phone: string | null;
};

/* Bagian notifikasi DOKU yang dipakai. Field lain sengaja diabaikan. */
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
