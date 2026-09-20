"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store";
import { usePOSStore } from "@/store";
import { CartDisplay } from "./CartDisplay";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { QRDisplay } from "@/components/codes/QRDisplay";
import { BarcodeDisplay } from "@/components/codes/BarcodeDisplay";
import { usePaymentMutation } from "@/hooks/usePayment";
import { useCreateTransaction } from "@/hooks";

const CODE_SECTION_ANIMATION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

const QR_CODE_SIZE_PX = 200;

export function POSScreen() {
  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const selectedPaymentMethod = usePOSStore((s) => s.selectedPaymentMethod);
  const setPaymentMethod = usePOSStore((s) => s.setPaymentMethod);
  const isPaymentProcessing = usePOSStore((s) => s.isPaymentProcessing);
  const clearCart = useCartStore((s) => s.clearCart);
  const setLastTransactionId = usePOSStore((s) => s.setLastTransactionId);

  const [isCodeSectionVisible, setIsCodeSectionVisible] = useState(false);
  const createTransaction = useCreateTransaction();
  const paymentMutation = usePaymentMutation(
    selectedPaymentMethod as "esewa" | "khalti" | "fonepay"
  );

  const qrPayload = useMemo(() => {
    return `scanpay:${selectedPaymentMethod}:${totalAmount()}`;
  }, [selectedPaymentMethod, totalAmount]);

  const barcodePayload = useMemo(() => {
    return `SCANPAY-${Date.now()}`;
  }, [isCodeSectionVisible]);

  const isPayButtonDisabled = useMemo(() => {
    return (
      isPaymentProcessing ||
      items.length === 0 ||
      !selectedPaymentMethod ||
      totalAmount() === 0
    );
  }, [isPaymentProcessing, items.length, selectedPaymentMethod, totalAmount]);

  const handleToggleCodeSection = useCallback(() => {
    setIsCodeSectionVisible((previousState) => !previousState);
  }, []);

  const handlePayment = useCallback(async () => {
    if (!selectedPaymentMethod) return;
    const result = await paymentMutation.mutateAsync({
      amount: totalAmount(),
      transactionId: crypto.randomUUID(),
    });
    if (result.transactionId) {
      setLastTransactionId(result.transactionId);
      clearCart();
    }
  }, [selectedPaymentMethod, paymentMutation, totalAmount, setLastTransactionId, clearCart]);

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">POS Terminal</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan items or select payment method
          </p>
        </div>
        <span className="material-symbols-outlined text-2xl text-primary">
          point_of_sale
        </span>
      </div>

      {/* Cart Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]">
        <CartDisplay />
      </div>

      {/* Payment Methods */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
          Payment Method
        </p>
        <PaymentMethodSelector
          selected={selectedPaymentMethod}
          onSelect={setPaymentMethod}
        />
      </div>

      {/* QR / Barcode Section */}
      <AnimatePresence>
        {isCodeSectionVisible && selectedPaymentMethod && (
          <motion.div
            {...CODE_SECTION_ANIMATION}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_2px_4px_-1px_rgba(15,23,42,0.06),0_1px_2px_-1px_rgba(15,23,42,0.04)]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4 text-center">
                Scan to Pay
              </p>
              <div className="flex flex-col items-center gap-5">
                <div className="p-3 bg-white rounded-xl border border-slate-100">
                  <QRDisplay value={qrPayload} size={QR_CODE_SIZE_PX} />
                </div>
                <div className="w-full flex items-center gap-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    or scan barcode
                  </span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="p-3 bg-slate-50 rounded-xl w-full flex justify-center">
                  <BarcodeDisplay data={barcodePayload} type="code128" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5 pb-4">
        <button
          onClick={handleToggleCodeSection}
          disabled={!selectedPaymentMethod}
          className="w-full h-[52px] rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">
            {isCodeSectionVisible ? "visibility_off" : "qr_code_2"}
          </span>
          {isCodeSectionVisible ? "Hide QR / Barcodes" : "Show QR / Barcodes"}
        </button>

        <button
          onClick={handlePayment}
          disabled={isPayButtonDisabled}
          className="w-full h-[52px] bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          {isPaymentProcessing && (
            <span className="material-symbols-outlined text-lg animate-spin">
              progress_activity
            </span>
          )}
          <span className="material-symbols-outlined text-lg">
            shopping_cart_checkout
          </span>
          Charge Rs. {totalAmount()} →
        </button>
      </div>
    </div>
  );
}
