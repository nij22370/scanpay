import { z } from "zod";

const TransactionSchema = z.object({
  id: z.string().uuid(),
  transaction_number: z.string().min(1, "Transaction number is required"),
  amount: z.number().positive("Amount must be positive"),
  tax_amount: z.number().nonnegative(),
  discount_amount: z.number().nonnegative(),
  total_amount: z.number().positive("Total must be positive"),
  payment_method: z.string().min(1, "Payment method is required"),
  payment_provider: z.string().nullable(),
  payment_status: z.string(),
  status: z.string(),
  customer_name: z.string().nullable(),
  customer_phone: z.string().nullable(),
  notes: z.string().nullable(),
  slip_url: z.string().nullable(),
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

export interface TransactionWithItems extends Transaction {
  items: TransactionItem[];
  cash_tendered?: number;
  cash_change?: number;
}

export interface TransactionItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}
