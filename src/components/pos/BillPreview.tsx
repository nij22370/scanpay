"use client";

import { useMemo } from "react";
import { X, Printer } from "lucide-react";
import { formatCurrency } from "@/lib/vat";
import { convertToBS } from "@/lib/nepali-date";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BillPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
  items: Array<{ product: Product; quantity: number }>;
  cashierName: string | null;
  getSubtotal: () => number;
  discount: number;
  vatApplicable: boolean;
}

export function BillPreview({
  isOpen,
  onClose,
  onPrint,
  items,
  cashierName,
  getSubtotal,
  discount,
  vatApplicable,
}: BillPreviewProps) {
  const now = new Date();
  const adDate = now.toLocaleString("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const bsDate = convertToBS(now);

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal]);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = vatApplicable ? Math.round(discountedSubtotal * 0.13 * 100) / 100 : 0;
  const total = Math.round((discountedSubtotal + vat) * 100) / 100;

  useMemo(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-label="Bill preview"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            "bg-white shadow-2xl max-h-[90vh] overflow-y-auto w-full",
            "lg:max-w-2xl lg:rounded-2xl lg:m-4",
            "max-w-full rounded-none"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-semibold text-slate-900">Bill Preview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onPrint}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Print bill"
              >
                <Printer className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close bill preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bill Content */}
          <div className="p-4 lg:p-6 space-y-4">
            {/* Store Info */}
            <div className="text-center space-y-1 border-b border-slate-200 pb-4">
              <h3 className="text-xl font-bold text-slate-900">ScanPay POS</h3>
              <p className="text-sm text-slate-500">Kathmandu, Nepal</p>
              <p className="text-xs text-slate-400">VAT Reg: 123456789</p>
            </div>

            {/* Date & Cashier */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date (A.D.)</p>
                <p className="font-medium text-slate-900">{adDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Date (B.S.)</p>
                <p className="font-medium text-slate-900">{bsDate}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Cashier</p>
                <p className="font-medium text-slate-900">{cashierName || "Cashier"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Invoice</p>
                <p className="font-medium text-slate-900 font-mono">INV-{Date.now().toString(36).toUpperCase()}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="border-t border-b border-slate-200 py-3">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-slate-400 font-medium uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-2">Item</th>
                      <th className="pb-2 text-center w-16">Qty</th>
                      <th className="pb-2 text-right w-28">Price</th>
                      <th className="pb-2 text-right w-28">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.product.id} className="text-slate-900">
                        <td className="py-2">
                          <p className="font-medium truncate max-w-[200px]">{item.product.name}</p>
                          {item.product.name_np && (
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{item.product.name_np}</p>
                          )}
                        </td>
                        <td className="py-2 text-center font-mono">{item.quantity}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(item.product.price)}</td>
                        <td className="py-2 text-right font-bold font-mono">
                          {formatCurrency(item.product.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-2 text-sm font-medium">
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

            {/* Payment Methods Placeholder */}
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-3 text-center">
                Select Payment Method
              </p>
              <div className="grid grid-cols-3 gap-3">
                <button className="py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                  Cash
                </button>
                <button className="py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                  Digital QR
                </button>
                <button className="py-3 px-4 rounded-xl border border-slate-200 bg-white text-slate-900 font-semibold text-sm hover:bg-slate-50 transition-colors cursor-pointer">
                  Split
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}