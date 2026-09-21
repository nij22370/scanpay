import { z } from "zod";
import { ProductSchema } from "@/types/product";

export { ProductSchema };

export const CreateProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  name_np: z.string().trim().optional(),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  category: z.string().trim().min(1, "Category is required"),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  low_stock_threshold: z.coerce
    .number()
    .int("Low stock threshold must be a whole number")
    .min(0, "Threshold cannot be negative")
    .default(10),
  vat_applicable: z.boolean().default(false),
  barcode: z.string().optional(),
  qr_data: z.string().optional(),
  image_url: z.string().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export type Product = z.infer<typeof ProductSchema>;
export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductFormData = CreateProduct;
