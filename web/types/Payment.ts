export type PaymentStatus = "pending" | "success" | "failed" | "expired";

export type PaymentStatusView = {
  invoice_number: string;
  status: PaymentStatus;
  amount: number;
  full_name: string;
};

export type PaymentSortDirection = "asc" | "desc";

export type Payment = {
  id: string;
  invoice_number: string;
  amount: number;
  status: PaymentStatus;
  payment_method: string | null;
  acquirer: string | null;
  paid_at: string | null;
  expired_date: string | null;
  created_at: string;

  full_name: string | null;
  student_nik: string | null;
  parent_email: string | null;
  father_phone: string | null;
  mother_phone: string | null;

  is_settled: boolean;
};

export type ListPaymentsParams = {
  search: string;
  statuses: PaymentStatus[];
  sort: PaymentSortDirection;
  limit: number;
  offset: number;
};

export type PaymentListPage = {
  items: Payment[];
  total: number;
  has_more: boolean;
};
