"use client";

import { useTodayTransactions } from "@/hooks";
import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, CheckCircle, AlertCircle } from "lucide-react";

export function DashboardOverview() {
  const { data: transactions } = useTodayTransactions();

  const totalRevenue = transactions
    ? transactions.reduce((sum: number, t) => sum + (t.total_amount ?? 0), 0)
    : 0;
  const completedCount = transactions
    ? transactions.filter((t) => t.status === "completed").length
    : 0;
  const pendingCount = transactions
    ? transactions.filter((t) => t.status === "pending").length
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Today's Revenue" value={`Rs. ${totalRevenue}`} />
        <StatCard icon={ShoppingBag} label="Transactions" value={String(transactions?.length ?? 0)} />
        <StatCard icon={CheckCircle} label="Completed" value={String(completedCount)} />
        <StatCard icon={AlertCircle} label="Pending" value={String(pendingCount)} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border rounded-lg"
    >
      <Icon className="w-8 h-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </motion.div>
  );
}