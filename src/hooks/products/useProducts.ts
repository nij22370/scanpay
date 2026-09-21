"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";
import type { CreateProduct } from "@/validators/product.schema";
import { generateRandomEan12, buildProductQrData } from "@/utils/barcode";

const QUERY_KEY_PRODUCTS = ["products"] as const;

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: QUERY_KEY_PRODUCTS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw new Error(error.message || "Failed to fetch products from Supabase");
      }
      return (data ?? []) as Product[];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation<Product, Error, CreateProduct>({
    mutationFn: async (newProductInput: CreateProduct) => {
      const id = crypto.randomUUID();
      const barcode =
        newProductInput.barcode?.trim() || generateRandomEan12();
      const qr_data =
        newProductInput.qr_data?.trim() ||
        buildProductQrData({
          id,
          name: newProductInput.name,
          price: newProductInput.price,
        });

      const productPayload = {
        id,
        name: newProductInput.name.trim(),
        name_np: newProductInput.name_np?.trim() || null,
        price: newProductInput.price,
        category: newProductInput.category.trim(),
        stock: newProductInput.stock,
        low_stock_threshold: newProductInput.low_stock_threshold ?? 10,
        vat_applicable: newProductInput.vat_applicable ?? false,
        barcode,
        qr_data,
        image_url: newProductInput.image_url?.trim() || null,
      };

      const { data, error } = await supabase
        .from("products")
        .insert(productPayload)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to insert product");
      }
      return data as Product;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    Error,
    Partial<Product> & { id: string },
    { previousProducts?: Product[] }
  >({
    mutationFn: async (updatedProductPayload) => {
      const { data, error } = await supabase
        .from("products")
        .update(updatedProductPayload)
        .eq("id", updatedProductPayload.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to update product");
      }
      return data as Product;
    },
    onMutate: async (newProduct) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY_PRODUCTS });
      const previousProducts =
        queryClient.getQueryData<Product[]>(QUERY_KEY_PRODUCTS);

      if (previousProducts) {
        queryClient.setQueryData<Product[]>(QUERY_KEY_PRODUCTS, (old) =>
          old
            ? old.map((product) =>
                product.id === newProduct.id
                  ? { ...product, ...newProduct }
                  : product
              )
            : []
        );
      }

      return { previousProducts };
    },
    onError: (_err, _newProduct, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(QUERY_KEY_PRODUCTS, context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation<string, Error, string>({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        throw new Error(error.message || "Failed to delete product");
      }
      return productId;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS });
    },
  });
}
