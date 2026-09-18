"use client";

import { motion } from "framer-motion";
import { useLowStockProducts } from "@/hooks";
import { AlertTriangle } from "lucide-react";

export function LowStockAlerts() {
  const { data: lowStock } = useLowStockProducts(5);

  if (!lowStock || lowStock.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
    >
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <h2 className="font-bold text-yellow-800">Low Stock Alerts</h2>
      </div>
      <div className="space-y-2">
        {lowStock.map((product) => (
          <div key={product.id} className="flex items-center justify-between text-sm">
            <span>{product.name}</span>
            <span className="text-yellow-700 font-medium">{product.stock} remaining</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
