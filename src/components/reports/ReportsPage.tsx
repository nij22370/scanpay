"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Transaction } from "@/types";
import { SlipsList } from "@/components/slip/SlipsList";
import { DateRangePicker } from "./DateRangePicker";

export function ReportsPage() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["transactions", "reports", dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase.from("transactions").select("*").order("created_at", { ascending: false });
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const totalRevenue = transactions
    ? transactions.reduce((sum, t) => sum + t.total_amount, 0)
    : 0;
  const byProvider = transactions
    ? transactions.reduce((acc, t) => {
        const p = t.payment_provider ?? "unknown";
        acc[p] = (acc[p] ?? 0) + t.total_amount;
        return acc;
      }, {} as Record<string, number>)
    : {};

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <DateRangePicker onFromChange={setDateFrom} onToChange={setDateTo} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold">Rs. {totalRevenue}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Transactions</p>
          <p className="text-2xl font-bold">{transactions?.length ?? 0}</p>
        </div>
      </div>
      <div className="p-4 border rounded-lg">
        <h2 className="font-bold mb-2">By Payment Provider</h2>
        <div className="space-y-1">
          {Object.entries(byProvider).map(([provider, amount]) => (
            <div key={provider} className="flex justify-between">
              <span className="capitalize">{provider}</span>
              <span>Rs. {amount}</span>
            </div>
          ))}
        </div>
      </div>
      {transactions && transactions.length > 0 && <SlipsList transactions={transactions} splitSessions={[]} />}
    </div>
  );
}
