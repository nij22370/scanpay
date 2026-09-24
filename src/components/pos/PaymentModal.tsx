"use client";

import { useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { BillPreview } from "./BillPreview";
import { formatCurrency } from "@/lib/vat";
import type { Product } from "@/types/product";

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

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal]);
  const vatApplicable = useMemo(
    () => items.some((item) => item.product.vat_applicable),
    [items]
  );
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = vatApplicable ? Math.round(discountedSubtotal * 0.13 * 100) / 100 : 0;
  const total = Math.round((discountedSubtotal + vat) * 100) / 100;

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as "cash" | "digital" | "split");
  }, []);

  const handleBillPreview = useCallback(() => {
    setShowBillPreview(true);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

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
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Cash payment placeholder - to be implemented in Phase 5</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["100", "500", "1000", "2000", "5000", "Exact"].map((amount) => (
                      <button key={amount} className="py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                        Rs. {amount}
                      </button>
                    ))}
                  </div>
                  <button className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2">
                    Complete Cash Payment
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="digital" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Digital QR payment placeholder - to be implemented in Phase 6</p>
                  <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
                    <span className="text-slate-400">QR Code will appear here</span>
                  </div>
                  <button className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2">
                    Generate QR & Wait for Payment
                  </button>
                </div>
              </TabsContent>

              <TabsContent value="split" className="mt-4 space-y-4">
                <div className="space-y-3">
                  <p className="text-sm text-slate-600">Split payment placeholder - to be implemented in Phase 7</p>
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="Amount 1" className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                      <input type="number" placeholder="Amount 2" className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    </div>
                    <button className="w-full h-12 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2">
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

// Need cn utility
import { cn } from "@/lib/utils";