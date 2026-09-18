import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types";

export function useProducts(filters?: Record<string, string>) {
  return useQuery<Product[]>({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq("is_active", true);
      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
      const { data, error } = await query.order("name", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function useProduct(productId: string) {
  return useQuery<Product | null>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", productId).single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("products").insert(product).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<Product> & { id: string }) => {
      const { data, error } = await supabase.from("products").update(product).eq("id", product.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
    },
  });
}