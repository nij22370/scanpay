"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Transaction } from "@/types";

export function useTodayTransactions() {
  const today = new Date().toISOString().split("T")[0];
  return useQuery<Transaction[]>({
    queryKey: ["transactions", "today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("created_at", today)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
