import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  cost_price: z.coerce.number().nonnegative("Cost price must be non-negative"),
  stock: z.coerce.number().int("Stock must be a whole number").nonnegative("Stock cannot be negative"),
  category: z.string().optional(),
  barcode: z.string().optional().or(z.null()),
  image_url: z.string().url("Invalid image URL").optional().or(z.null()),
  is_active: z.boolean().default(true),
});

export type ProductFormData = z.infer<typeof productSchema>;

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  tax_amount: z.coerce.number().nonnegative().default(0),
  discount_amount: z.coerce.number().nonnegative().default(0),
  total_amount: z.coerce.number().positive("Total must be positive"),
  payment_method: z.enum(["esewa", "khalti", "fonepay", "cash", "card"]),
  payment_provider: z.string().optional(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const splitSchema = z.object({
  total_amount: z.coerce.number().positive("Total must be positive"),
  participants: z.array(
    z.object({
      user_id: z.string().min(1, "User is required"),
      assigned_amount: z.coerce.number().positive("Amount must be positive"),
    })
  ).min(2, "At least 2 participants required"),
});

export type SplitFormData = z.infer<typeof splitSchema>;

export const paymentVerifySchema = z.object({
  transactionId: z.string().uuid("Invalid transaction ID"),
  providerRefId: z.string().optional(),
  signature: z.string().optional(),
});

export type PaymentVerifyData = z.infer<typeof paymentVerifySchema>;

export const searchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export type SearchParams = z.infer<typeof searchSchema>;
