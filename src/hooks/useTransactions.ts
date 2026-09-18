import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Transaction } from "@/types";

export function useTransactions(filters?: { status?: string; payment_provider?: string; from?: string; to?: string }) {
  return useQuery<Transaction[]>({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      let query = supabase.from("transactions").select("*").order("created_at", { ascending: false });
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.payment_provider) query = query.eq("payment_provider", filters.payment_provider);
      if (filters?.from) query = query.gte("created_at", filters.from);
      if (filters?.to) query = query.lte("created_at", filters.to);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useTransaction(transactionId: string) {
  return useQuery<Transaction | null>({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").eq("id", transactionId).single();
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!transactionId,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("transactions").insert(transaction).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase.from("transactions").update(transaction).eq("id", transaction.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transaction", variables.id] });
    },
  });
}