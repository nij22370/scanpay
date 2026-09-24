"use client";

import { useState, useCallback } from "react";
import { useCartStore } from "@/store";
import { Trash2, Minus, Plus, X, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/vat";
import { useCartTotals } from "@/hooks/pos/useCartTotals";
import { cn } from "@/lib/utils";

interface CartPanelProps {
  onPay: () => void;
}

export function CartPanel({ onPay }: CartPanelProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const [discount, setDiscount] = useState(0);

  const { formatted, vatApplicable } = useCartTotals(discount);

  const handleDiscountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Math.max(0, Number(event.target.value) || 0);
      setDiscount(value);
    },
    []
  );

  const handleQuantityChange = useCallback(
    (productId: string, delta: number) => {
      const item = items.find((i) => i.product.id === productId);
      if (item) {
        const newQuantity = Math.max(0, item.quantity + delta);
        updateQuantity(productId, newQuantity);
      }
    },
    [items, updateQuantity]
  );

  const handleRemoveItem = useCallback(
    (productId: string) => {
      removeItem(productId);
    },
    [removeItem]
  );

  return (
    <div className="hidden lg:flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="font-bold text-slate-900">Current Order</span>
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
            {getItemCount()} {getItemCount() === 1 ? "item" : "items"}
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
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <div className="flex-1 min-w-0 pr-3">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {item.product.name}
                </p>
                <p className="text-xs text-slate-500 font-medium">
                  {formatCurrency(item.product.price)} each
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleQuantityChange(item.product.id, -1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-slate-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(item.product.id, 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRemoveItem(item.product.id)}
                  className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors ml-1"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="font-extrabold text-sm text-slate-900 w-24 text-right shrink-0">
                {formatCurrency(item.product.price * item.quantity)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <svg className="w-14 h-14 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 12h-4l-3 3m-5-3v12m-4-4l3 3m4-4H6a2 2 0 01-2-2V7a2 2 0 012-2h7a2 2 0 012 2v4" />
            </svg>
            <p className="text-sm font-medium">Cart is empty</p>
            <p className="text-xs text-slate-400">Search products or scan barcode to add</p>
          </div>
        )}
      </div>

      {/* Totals & Controls */}
      {items.length > 0 && (
        <div className="border-t border-slate-200 p-4 space-y-4">
          {/* Discount Input */}
          <div className="space-y-2">
            <label htmlFor="discount-input-desktop" className="text-xs font-medium text-slate-500 block">
              Discount (Rs)
            </label>
            <input
              id="discount-input-desktop"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={handleDiscountChange}
              className="w-full h-10 px-4 rounded-xl border border-slate-200 bg-white text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {/* VAT Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div>
              <p className="text-xs font-medium text-slate-900">VAT (13%)</p>
              <p className="text-[11px] text-slate-400">
                {vatApplicable ? "Applied to taxable items" : "No taxable items in cart"}
              </p>
            </div>
            <span className="font-mono text-sm text-slate-900">{formatted.vat}</span>
          </div>

          {/* Totals Breakdown */}
          <div className="space-y-1.5 text-xs border-t border-slate-200 pt-3">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-mono">{formatted.subtotal}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Discount:</span>
              <span className="font-mono text-rose-600">- {formatted.discount}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>VAT (13%):</span>
              <span className="font-mono">{formatted.vat}</span>
            </div>
            <div className="flex justify-between items-center text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total:</span>
              <span className="text-emerald-700 text-lg">{formatted.total}</span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={onPay}
            className="w-full h-12 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-base transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">shopping_cart_checkout</span>
            Pay {formatted.total}
          </button>

          {/* Clear Cart Button */}
          <button
            onClick={clearCart}
            className="w-full h-10 text-slate-500 hover:text-rose-600 font-medium text-sm transition-colors cursor-pointer"
          >
            Clear cart
          </button>
        </div>
      )}
    </div>
  );
}