import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Product name is required"),
  name_np: z.string().nullable().optional(),
  price: z.number().min(0, "Price must be at least 0"),
  category: z.string().min(1, "Category is required"),
  stock: z
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  low_stock_threshold: z
    .number()
    .int("Low stock threshold must be a whole number")
    .min(0, "Threshold cannot be negative")
    .default(10),
  vat_applicable: z.boolean().default(false),
  barcode: z.string().nullable().optional(),
  qr_data: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export interface ProductWithLowStock extends Product {
  is_low_stock: boolean;
}

export type CodeType = "qr" | "ean13" | "code128" | "datamatrix";
