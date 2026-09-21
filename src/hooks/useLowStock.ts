"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export function useLowStockProducts(threshold: number = 5) {
  return useQuery<Product[]>({
    queryKey: ["products", "low-stock", threshold],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lte("stock", threshold);
      if (error) throw error;
      return (data ?? []) as Product[];
    },
    refetchInterval: 30000,
  });
}