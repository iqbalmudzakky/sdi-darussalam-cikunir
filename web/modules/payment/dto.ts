import { z } from "zod";
import type { PaymentStatus } from "./entity";

const PAYMENT_STATUSES: [PaymentStatus, ...PaymentStatus[]] = [
  "pending",
  "success",
  "failed",
  "expired",
];

const SORT_DIRECTION_VALUES = ["asc", "desc"] as const;

export const ListPaymentsRequestSchema = z.object({
  search: z.string().trim().max(100).default(""),
  statuses: z.array(z.enum(PAYMENT_STATUSES)).default([]),
  sort: z.enum(SORT_DIRECTION_VALUES).default("desc"),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export type ListPaymentsRequest = z.infer<typeof ListPaymentsRequestSchema>;

export type PaymentListItemResponse = {
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

export type PaymentListResponse = {
  items: PaymentListItemResponse[];
  total: number;
  has_more: boolean;
};
