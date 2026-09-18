"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Transaction, SplitSession } from "@/types";

interface SlipsListProps {
  transactions: Transaction[];
  splitSessions: SplitSession[];
}

export function SlipsList({ transactions, splitSessions }: SlipsListProps) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Transaction Slips</h1>

      {transactions.map((t) => (
        <motion.div
          key={t.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p className="font-bold">{t.transaction_number}</p>
            <p className="text-sm text-muted-foreground">{t.transaction_number}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Rs. {t.total_amount}</p>
            <p className={`text-sm ${t.payment_status === "completed" ? "text-green-600" : t.payment_status === "failed" ? "text-red-600" : "text-yellow-600"}`}>
              {t.payment_status}
            </p>
          </div>
        </motion.div>
      ))}

      {splitSessions.map((s) => (
        <motion.div
          key={s.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p className="font-bold">Split #{s.id.slice(0, 8)}</p>
            <p className="text-sm text-muted-foreground">Linked to transaction</p>
          </div>
          <div className="text-right">
            <p className="font-bold">Rs. {s.total_amount}</p>
            <p className={`text-sm ${s.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>
              {s.status}
            </p>
          </div>
        </motion.div>
      ))}

      {transactions.length === 0 && splitSessions.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No transactions yet</p>
      )}
    </div>
  );
}
