"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateProductSchema } from "@/validators";
import type { ProductFormData } from "@/validators";
import type { Product } from "@/types";

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormData) => void;
}

export function ProductForm({ product, onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: product
      ? {
          name: product.name,
          name_np: product.name_np ?? "",
          price: product.price,
          category: product.category,
          stock: product.stock,
          low_stock_threshold: product.low_stock_threshold ?? 10,
          vat_applicable: product.vat_applicable ?? false,
          barcode: product.barcode ?? "",
          qr_data: product.qr_data ?? "",
        }
      : {
          name: "",
          name_np: "",
          price: 0,
          category: "",
          stock: 0,
          low_stock_threshold: 10,
          vat_applicable: false,
          barcode: "",
          qr_data: "",
        },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 p-4 border rounded-lg"
    >
      <h2 className="text-lg font-bold">
        {product ? "Edit" : "Add"} Product
      </h2>
      <div>
        <label className="text-sm font-medium">Name *</label>
        <input
          {...register("name")}
          className="w-full p-2 border rounded"
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-medium">Name (Nepali)</label>
        <input
          {...register("name_np")}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Price *</label>
          <input
            type="number"
            {...register("price")}
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
          />
          {errors.price && (
            <p className="text-sm text-red-500">{errors.price.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Stock *</label>
          <input
            type="number"
            {...register("stock")}
            className="w-full p-2 border rounded"
            min="0"
          />
          {errors.stock && (
            <p className="text-sm text-red-500">{errors.stock.message}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Category *</label>
          <input
            {...register("category")}
            className="w-full p-2 border rounded"
          />
          {errors.category && (
            <p className="text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Low Stock Threshold</label>
          <input
            type="number"
            {...register("low_stock_threshold")}
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg cursor-pointer"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 border rounded-lg cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}