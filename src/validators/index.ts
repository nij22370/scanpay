export * from "./product.schema";
export * from "./transaction.schema";
export * from "./split.schema";

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export { ProductSchema as productSchema } from "./product.schema";
export { TransactionSchema as transactionSchema } from "./transaction.schema";
export { SplitSessionSchema as splitSchema } from "./split.schema";
export type { CreateProduct as ProductFormData } from "./product.schema";
