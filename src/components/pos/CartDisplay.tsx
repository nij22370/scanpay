"use client";

import { useCartStore } from "@/store";
import { Trash2, Minus, Plus, Users, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, VAT_RATE } from "@/lib/vat";
import Link from "next/link";

export function CartDisplay() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const grandTotal = getSubtotal();
  const subtotal = grandTotal / (1 + VAT_RATE);
  const vatAmount = grandTotal - subtotal;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4 text-primary" />
          <span className="font-bold text-slate-900">Current Cart</span>
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
            {getItemCount()} items
          </span>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.product.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-semibold text-xs text-slate-900 truncate">{item.product.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">
                  {formatCurrency(item.product.price)} each
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="font-extrabold text-xs text-slate-900 w-20 text-right shrink-0">
                {formatCurrency(item.product.price * item.quantity)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length === 0 && (
        <div className="text-center py-8 text-slate-400 space-y-1">
          <ShoppingCart className="w-8 h-8 mx-auto text-slate-300" />
          <p className="text-xs font-medium">Cart is empty</p>
          <p className="text-[11px] text-slate-400">Search products or scan barcode to add</p>
        </div>
      )}

      {/* Totals & Breakdown */}
      {items.length > 0 && (
        <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal (Excl. VAT):</span>
            <span className="font-mono">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>VAT (13%):</span>
            <span className="font-mono">{formatCurrency(vatAmount)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
            <span>Grand Total:</span>
            <span className="text-emerald-700 text-base">{formatCurrency(grandTotal)}</span>
          </div>

          <div className="pt-2">
            <Link
              href="/split"
              className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" /> Split Bill among multiple customers
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}