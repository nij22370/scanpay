"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2 } from "lucide-react";

interface PaymentSuccessProps {
  transactionId: string;
  amount: number;
  onNewTransaction: () => void;
}

export function PaymentSuccess({ transactionId, amount, onNewTransaction }: PaymentSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 p-8 text-center"
    >
      <CheckCircle className="w-16 h-16 text-green-600" />
      <h2 className="text-2xl font-bold">Payment Successful</h2>
      <p className="text-lg">Rs. {amount}</p>
      <p className="text-sm text-muted-foreground font-mono">{transactionId}</p>
      <button
        onClick={onNewTransaction}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        New Transaction
      </button>
    </motion.div>
  );
}

export function PaymentProcessing() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <Loader2 className="w-12 h-12 animate-spin text-primary" />
      <p className="text-lg font-medium">Processing payment...</p>
    </div>
  );
}

export function PaymentCancelled({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold">Payment Cancelled</h2>
      <p className="text-muted-foreground">You can try again</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg"
      >
        Try Again
      </button>
    </div>
  );
}
