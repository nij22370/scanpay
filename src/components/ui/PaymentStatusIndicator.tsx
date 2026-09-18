"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentStatusIndicatorProps {
  status: "completed" | "failed" | "pending";
}

export function PaymentStatusIndicator({ status }: PaymentStatusIndicatorProps) {
  const config = {
    completed: { icon: CheckCircle2, color: "text-green-600", label: "Completed" },
    failed: { icon: XCircle, color: "text-red-600", label: "Failed" },
    pending: { icon: null, color: "text-yellow-600", label: "Pending" },
  };

  const { icon: Icon, color, label } = config[status];

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex items-center gap-1 text-sm font-medium ${color}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {label}
    </motion.span>
  );
}
