"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store";
import { usePOSStore } from "@/store";
import { CartDisplay } from "./CartDisplay";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { QRDisplay } from "@/components/codes/QRDisplay";
import { BarcodeDisplay } from "@/components/codes/BarcodeDisplay";
import { usePaymentMutation } from "@/hooks/usePayment";
import { useCreateTransaction } from "@/hooks";
import { Loader2 } from "lucide-react";

export function POSScreen() {
  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const selectedPaymentMethod = usePOSStore((s) => s.selectedPaymentMethod);
  const setPaymentMethod = usePOSStore((s) => s.setPaymentMethod);
  const isPaymentProcessing = usePOSStore((s) => s.isPaymentProcessing);
  const clearCart = useCartStore((s) => s.clearCart);
  const setLastTransactionId = usePOSStore((s) => s.setLastTransactionId);

  const [showQR, setShowQR] = useState(false);
  const createTransaction = useCreateTransaction();
  const paymentMutation = usePaymentMutation(selectedPaymentMethod as "esewa" | "khalti" | "fonepay");

  const handlePayment = async () => {
    if (!selectedPaymentMethod) return;
    const result = await paymentMutation.mutateAsync({
      amount: totalAmount(),
      transactionId: crypto.randomUUID(),
    });
    if (result.transactionId) {
      setLastTransactionId(result.transactionId);
      clearCart();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">POS</h1>

      <CartDisplay />

      <PaymentMethodSelector
        selected={selectedPaymentMethod}
        onSelect={setPaymentMethod}
      />

      <AnimatePresence>
        {showQR && selectedPaymentMethod && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <QRDisplay value={`scanpay:${selectedPaymentMethod}:${totalAmount()}`} size={200} />
            <BarcodeDisplay data={`SCANPAY-${Date.now()}`} type="code128" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowQR(!showQR)}
        disabled={!selectedPaymentMethod}
        className="w-full p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
      >
        {showQR ? "Hide QR/Barcodes" : "Show QR/Barcodes"}
      </button>

      <button
        onClick={handlePayment}
        disabled={
          isPaymentProcessing ||
          items.length === 0 ||
          !selectedPaymentMethod ||
          totalAmount() === 0
        }
        className="w-full p-4 bg-green-600 text-white rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPaymentProcessing && <Loader2 className="w-5 h-5 animate-spin" />}
        Pay Rs. {totalAmount()}
      </button>
    </div>
  );
}
