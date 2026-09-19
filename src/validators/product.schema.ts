import { z } from "zod";

export const ProductSchema = z.object({
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

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
