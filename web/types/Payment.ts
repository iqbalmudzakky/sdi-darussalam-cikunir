export type PaymentStatus = "pending" | "success" | "failed" | "expired";

export type PaymentStatusView = {
  invoice_number: string;
  status: PaymentStatus;
  amount: number;
  full_name: string;
};
