import { z } from "zod";

const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().nullable(),
  price: z.number().positive("Price must be positive"),
  cost_price: z.number().nonnegative("Cost price must be non-negative"),
  stock: z.number().int("Stock must be a whole number").nonnegative("Stock cannot be negative"),
  category: z.string().nullable(),
  barcode: z.string().nullable(),
  image_url: z.string().url("Invalid image URL").nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Product = z.infer<typeof ProductSchema>;

export interface ProductWithLowStock extends Product {
  is_low_stock: boolean;
}

export type CodeType = "qr" | "ean13" | "code128" | "datamatrix";
