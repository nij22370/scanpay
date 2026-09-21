export {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "./products/useProducts";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/types/product";

export function useProduct(productId: string) {
  return useQuery<Product | null>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as Product | null;
    },
    enabled: !!productId,
  });
}