"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { BillPreview } from "./BillPreview";
import { formatCurrency } from "@/lib/vat";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useCartStore } from "@/store";
import { useAuthStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { QRGenerator } from "@/components/codes/QRGenerator";
import { environment } from "@/lib/payments/env";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ product: Product; quantity: number }>;
  cashierName: string | null;
  getSubtotal: () => number;
  selectedPaymentMethod: string | null;
}

export function PaymentModal({
  isOpen,
  onClose,
  items,
  cashierName,
  getSubtotal,
  selectedPaymentMethod,
}: PaymentModalProps) {
  const [activeTab, setActiveTab] = useState<"cash" | "digital" | "split">("cash");
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [cashTendered, setCashTendered] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [digitalGateway, setDigitalGateway] = useState<"esewa" | "khalti" | "fonepay">("esewa");
  const [esewaTransactionId, setEsewaTransactionId] = useState<string | null>(null);
  const [esewaQrData, setEsewaQrData] = useState<string | null>(null);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { addToast } = useToast();
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal]);
  const vatApplicable = useMemo(
    () => items.some((item) => item.product.vat_applicable),
    [items]
  );
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = vatApplicable ? Math.round(discountedSubtotal * 0.13 * 100) / 100 : 0;
  const total = Math.round((discountedSubtotal + vat) * 100) / 100;

  const cashChange = cashTendered ? Math.max(0, Number(cashTendered) - total) : 0;
  const isCashValid = cashTendered && Number(cashTendered) >= total;

  useEffect(() => {
    if (activeTab === "cash" && cashInputRef.current) {
      cashInputRef.current.focus();
      cashInputRef.current.select();
    }
  }, [activeTab]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "cash" | "digital" | "split");
    setCashTendered("");
  }, []);

  const handleBillPreview = useCallback(() => {
    setShowBillPreview(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCashConfirm = useCallback(async () => {
    if (!isCashValid) return;

    setIsProcessing(true);
    try {
      let cashierId = useAuthStore.getState().cashierId;
      if (!cashierId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cashierId)) {
        cashierId = '00000000-0000-0000-0000-000000000000';
        addToast("Using test cashier (login for real transactions)", "info");
      }

      const transactionItems = items.map((item) => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      }));

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: transactionItems,
          subtotal,
          discount,
          vat,
          total,
          payment_mode: "cash",
          cash_tendered: Number(cashTendered),
          cash_change: cashChange,
          cashier_id: cashierId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      clearCart();
      addToast("Cash payment successful!", "success");
      onClose();
      router.push(`/slip/${data.transactionId}`);
    } catch (error) {
      addToast("Payment failed — please try again", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [isCashValid, cashTendered, items, subtotal, discount, vat, total, cashChange, clearCart, addToast, onClose, router]);

   const handleDigitalGenerateQr = useCallback(async () => {
    let cashierId = useAuthStore.getState().cashierId;
    if (!cashierId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cashierId)) {
      cashierId = '00000000-0000-0000-0000-000000000000';
    }

    const transactionItems = items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }));

    setIsGeneratingQr(true);
    try {
      const payload = {
        items: transactionItems,
        subtotal,
        discount,
        vat,
        total,
        payment_mode: "esewa" as const,
        cashier_id: cashierId,
      };
      const createRes = await fetch("/api/transactions/digital-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: transactionItems,
          subtotal,
          discount,
          vat,
          total,
          payment_mode: "esewa",
          cashier_id: cashierId,
        }),
      });

      const created = await createRes.json();
      if (!createRes.ok) {
        throw new Error(created.error || "Failed to create transaction");
      }

      const txId = created.transactionId;
      setEsewaTransactionId(txId);

      const initiateRes = await fetch("/api/payments/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, transactionId: txId }),
      });

      const data = await initiateRes.json();
      if (!initiateRes.ok) {
        throw new Error(data.error || "Failed to initiate eSewa payment");
      }

      const paymentUrl = `${environment.appUrl}/pay/esewa/${txId}`;
      setEsewaQrData(paymentUrl);
      addToast("QR generated — scan with eSewa app to pay", "info");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to generate payment QR", "error");
    } finally {
      setIsGeneratingQr(false);
    }
  }, [items, subtotal, discount, vat, total, addToast]);

  const handleBrowserPayment = useCallback(async () => {
    let cashierId = useAuthStore.getState().cashierId;
    if (!cashierId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cashierId)) {
      cashierId = '00000000-0000-0000-0000-000000000000';
    }

    const transactionItems = items.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      total_price: item.product.price * item.quantity,
    }));

    setIsProcessing(true);
    try {
      const createRes = await fetch("/api/transactions/digital-pending", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: transactionItems,
          subtotal,
          discount,
          vat,
          total,
          payment_mode: "esewa",
          cashier_id: cashierId,
        }),
      });

      const created = await createRes.json();
      if (!createRes.ok) {
        throw new Error(created.error || "Failed to create transaction");
      }

      const txId = created.transactionId;
      setEsewaTransactionId(txId);

      const initiateRes = await fetch("/api/payments/esewa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total, transactionId: txId }),
      });

      const data = await initiateRes.json();
      if (!initiateRes.ok) {
        throw new Error(data.error || "Failed to initiate eSewa payment");
      }

      const paymentUrl = `${environment.appUrl}/pay/esewa/${txId}`;
      window.open(paymentUrl, "_blank", "noopener,noreferrer");

      addToast("Opening eSewa payment in browser...", "info");
    } catch (error) {
      addToast(error instanceof Error ? error.message : "Failed to open browser payment", "error");
    } finally {
      setIsProcessing(false);
    }
  }, [items, subtotal, discount, vat, total, addToast]);

  const { data: polledTx, refetch: refetchTx } = useQuery({
    queryKey: ["transaction-poll", esewaTransactionId],
    queryFn: async () => {
      if (!esewaTransactionId) return null;
      const res = await fetch(`/api/transactions/${esewaTransactionId}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!esewaTransactionId,
    refetchInterval: esewaTransactionId ? 3000 : false,
  });

  useEffect(() => {
    if (polledTx?.payment_status === "completed" && polledTx.payment_method === "esewa") {
      clearCart();
      addToast("eSewa payment successful!", "success");
      onClose();
      router.push(`/slip/${esewaTransactionId}`);
    }
  }, [polledTx?.payment_status, polledTx?.payment_method, esewaTransactionId, clearCart, addToast, onClose, router]);

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={cn(
          "max-h-[90vh] overflow-y-auto",
          "sm:max-w-2xl",
          "w-full h-full max-w-full rounded-none"
        )}>
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-200">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Payment &mdash; {formatCurrency(total)}
            </DialogTitle>
            <DialogClose asChild>
              <button className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors" aria-label="Close payment modal">
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </DialogClose>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Discount Input */}
            <div className="space-y-2">
              <label htmlFor="payment-discount" className="text-xs font-medium text-slate-500 block">
                Discount (Rs)
              </label>
              <input
                id="payment-discount"
                type="number"
                min="0"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            {/* Totals Summary */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span className="font-mono">- {formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT (13%)</span>
                <span className="font-mono">{vatApplicable ? formatCurrency(vat) : "Exempt"}</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>TOTAL</span>
                <span className="text-emerald-700">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-xl">
                <TabsTrigger value="cash" className="py-2 text-sm font-medium">
                  Cash
                </TabsTrigger>
                <TabsTrigger value="digital" className="py-2 text-sm font-medium">
                  Digital QR
                </TabsTrigger>
                <TabsTrigger value="split" className="py-2 text-sm font-medium">
                  Split
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cash" className="mt-4 space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="cash-tendered" className="text-xs font-medium text-slate-500 block">
                      Amount received (Rs)
                    </label>
                    <input
                      ref={cashInputRef}
                      id="cash-tendered"
                      type="number"
                      min={total}
                      step="0.01"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder={total.toFixed(2)}
                      autoFocus={activeTab === "cash"}
                    />
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Total</span>
                      <span className="font-mono text-slate-900">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tendered</span>
                      <span className="font-mono text-slate-900">{cashTendered ? formatCurrency(Number(cashTendered)) : "Rs 0.00"}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-slate-200">
                      <span className={cashChange > 0 ? "text-emerald-700" : "text-rose-600"}>Change</span>
                      <span className={cashChange > 0 ? "text-emerald-700" : "text-rose-600"}>
                        {cashTendered ? formatCurrency(cashChange) : "Rs 0.00"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCashConfirm}
                    disabled={!isCashValid || isProcessing}
                    className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessing && (
                      <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    )}
                    Confirm payment
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="digital" className="mt-4 space-y-4">
                <div className="space-y-4">
                  {/* Gateway Selector */}
                  <div className="grid grid-cols-3 gap-2">
                    {(["esewa", "khalti", "fonepay"] as const).map((gateway) => (
                      <button
                        key={gateway}
                        onClick={() => setDigitalGateway(gateway)}
                        className={cn(
                          "h-10 rounded-xl border text-sm font-medium capitalize transition-all cursor-pointer",
                          digitalGateway === gateway
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {gateway}
                      </button>
                    ))}
                  </div>

                  {digitalGateway === "esewa" ? (
                    esewaQrData ? (
                      <div className="flex flex-col items-center gap-4">
                        <QRGenerator data={esewaQrData} size={200} hideDownload />
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-700">
                            Scan with any QR scanner to pay {formatCurrency(total)}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Polling for payment status...
                          </p>
                          <button
                            onClick={handleBrowserPayment}
                            className="mt-2 text-xs text-primary hover:text-primary/80 font-medium cursor-pointer"
                          >
                            Or pay via browser
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={handleDigitalGenerateQr}
                          disabled={isGeneratingQr}
                          className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingQr && (
                            <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                          )}
                          Generate QR & Wait for Payment
                        </button>
                        <button
                          onClick={handleBrowserPayment}
                          className="w-full h-12 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
                        >
                          Pay via Browser
                        </button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-slate-500 mb-4">{digitalGateway} integration coming in Phase 6</p>
                      <button className="w-full h-12 bg-slate-100 text-slate-400 rounded-xl font-semibold cursor-not-allowed" disabled>
                        Generate QR &amp; Wait for Payment
                      </button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="split" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Split payment placeholder - to be implemented in Phase 7</p>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Amount 1" className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" disabled />
                      <input type="number" placeholder="Amount 2" className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" disabled />
                    </div>
                    <button className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2" disabled>
                      Process Split Payment
                    </button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Bill Preview Button */}
            <button
              onClick={handleBillPreview}
              className="w-full h-10 rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">preview</span>
              Preview Bill
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bill Preview Overlay */}
      <BillPreview
        isOpen={showBillPreview}
        onClose={() => setShowBillPreview(false)}
        onPrint={handlePrint}
        items={items}
        cashierName={cashierName}
        getSubtotal={getSubtotal}
        discount={discount}
        vatApplicable={vatApplicable}
      />
    </>
  );
}