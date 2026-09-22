"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

const QUERY_KEY_PRODUCTS = ["products"] as const;

export function useInventory() {
  return useQuery<Product[]>({
    queryKey: [...QUERY_KEY_PRODUCTS, "inventory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("stock", { ascending: true });

      if (error) {
        throw new Error(error.message || "Failed to fetch inventory from Supabase");
      }
      return (data ?? []) as Product[];
    },
  });
}

export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation<
    Product,
    Error,
    { id: string; stock: number },
    { previousProducts?: Product[] }
  >({
    mutationFn: async ({ id, stock }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ stock })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || "Failed to update stock");
      }
      return data as Product;
    },
    onMutate: async ({ id, stock }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY_PRODUCTS });

      const previousProducts = queryClient.getQueryData<Product[]>(QUERY_KEY_PRODUCTS);

      if (previousProducts) {
        queryClient.setQueryData<Product[]>(QUERY_KEY_PRODUCTS, (old) =>
          old
            ? old.map((product) =>
                product.id === id ? { ...product, stock } : product
              )
            : []
        );
      }

      return { previousProducts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(QUERY_KEY_PRODUCTS, context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS });
    },
  });
}

export function useBulkUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation<
    Product[],
    Error,
    Array<{ id: string; stock: number }>,
    { previousProducts?: Product[] }
  >({
    mutationFn: async (updates) => {
      const { data, error } = await supabase
        .from("products")
        .upsert(updates, { onConflict: "id" })
        .select();

      if (error) {
        throw new Error(error.message || "Failed to bulk update stock");
      }
      return (data ?? []) as Product[];
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY_PRODUCTS });

      const previousProducts = queryClient.getQueryData<Product[]>(QUERY_KEY_PRODUCTS);

      if (previousProducts) {
        const updateMap = new Map(updates.map((u) => [u.id, u.stock]));
        queryClient.setQueryData<Product[]>(QUERY_KEY_PRODUCTS, (old) =>
          old
            ? old.map((product) => {
                const newStock = updateMap.get(product.id);
                return newStock !== undefined ? { ...product, stock: newStock } : product;
              })
            : []
        );
      }

      return { previousProducts };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousProducts) {
        queryClient.setQueryData(QUERY_KEY_PRODUCTS, context.previousProducts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_PRODUCTS });
    },
  });
}

export function getStockStatus(product: Product): "OK" | "LOW" | "OUT" {
  if (product.stock <= 0) return "OUT";
  if (product.stock <= (product.low_stock_threshold ?? 10)) return "LOW";
  return "OK";
}