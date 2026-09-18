"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema } from "@/validators";
import type { ProductFormData } from "@/validators";
import type { Product } from "@/types";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description ?? "",
          price: product.price,
          cost_price: product.cost_price,
          stock: product.stock,
          category: product.category ?? "",
          barcode: product.barcode ?? "",
          image_url: product.image_url ?? "",
          is_active: product.is_active,
        }
      : {
          name: "",
          description: "",
          price: 0,
          cost_price: 0,
          stock: 0,
          category: "",
          barcode: "",
          image_url: "",
          is_active: true,
        },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-lg font-bold">{product ? "Edit" : "Add"} Product</h2>
      <div>
        <label className="text-sm font-medium">Name *</label>
        <input {...register("name")} className="w-full p-2 border rounded" />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea {...register("description")} className="w-full p-2 border rounded" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Price *</label>
          <input type="number" {...register("price")} className="w-full p-2 border rounded" step="0.01" min="0" />
          {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Cost Price</label>
          <input type="number" {...register("cost_price")} className="w-full p-2 border rounded" step="0.01" min="0" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Stock *</label>
          <input type="number" {...register("stock")} className="w-full p-2 border rounded" min="0" />
          {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <input {...register("category")} className="w-full p-2 border rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Barcode</label>
          <input {...register("barcode")} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label className="text-sm font-medium">Image URL</label>
          <input {...register("image_url")} className="w-full p-2 border rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Save</button>
        <button type="button" onClick={() => reset()} className="px-4 py-2 border rounded-lg">Cancel</button>
      </div>
    </form>
  );
}