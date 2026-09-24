"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store";
import { Trash2, Minus, Plus, X, GripVertical } from "lucide-react";
import { formatCurrency, VAT_RATE } from "@/lib/vat";
import { useCartTotals } from "@/hooks/pos/useCartTotals";
import { cn } from "@/lib/utils";

const HANDLE_HEIGHT_PX = 80;
const EXPANDED_HEIGHT_RATIO = 0.8;

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: () => void;
}

export function CartSheet({ isOpen, onClose, onPay }: CartSheetProps) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const getItemCount = useCartStore((s) => s.getItemCount);

  const [isExpanded, setIsExpanded] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const y = useMotionValue(isExpanded ? 0 : viewportHeight - HANDLE_HEIGHT_PX);
  const springY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleHeight = useMotionValue(HANDLE_HEIGHT_PX);
  const expandedHeight = useMotionValue(viewportHeight * EXPANDED_HEIGHT_RATIO);

  const progress = useTransform(springY, [
    viewportHeight - HANDLE_HEIGHT_PX,
    0,
  ], [0, 1]);

  useEffect(() => {
    setViewportHeight(window.innerHeight);
    const handleResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      y.set(viewportHeight - HANDLE_HEIGHT_PX);
      setIsExpanded(false);
      setDragY(0);
    } else {
      y.set(viewportHeight);
    }
  }, [isOpen, viewportHeight]);

  useEffect(() => {
    expandedHeight.set(viewportHeight * EXPANDED_HEIGHT_RATIO);
    if (!isExpanded) {
      y.set(viewportHeight - HANDLE_HEIGHT_PX);
    }
  }, [isExpanded, viewportHeight]);

  const handleDragStart = useCallback((event: MouseEvent | TouchEvent | PointerEvent) => {
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
    setDragY(clientY - springY.get());
  }, [springY]);

  const handleDragMove = useCallback((event: MouseEvent | TouchEvent | PointerEvent) => {
    const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;
    const newY = Math.max(0, Math.min(clientY - dragY, viewportHeight - HANDLE_HEIGHT_PX));
    y.set(newY);
  }, [dragY, viewportHeight]);

  const handleDragEnd = useCallback(() => {
    const currentY = springY.get();
    const midpoint = (viewportHeight - HANDLE_HEIGHT_PX) / 2;
    if (currentY < midpoint) {
      y.set(0);
      setIsExpanded(true);
    } else {
      y.set(viewportHeight - HANDLE_HEIGHT_PX);
      setIsExpanded(false);
    }
    setDragY(0);
  }, [springY, viewportHeight]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

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

  if (!isOpen || viewportHeight === 0) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping cart"
    >
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        style={{ y: springY }}
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] flex flex-col"
        drag="y"
        dragConstraints={{ top: 0, bottom: viewportHeight - HANDLE_HEIGHT_PX }}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        {/* Handle Bar */}
        <div className="flex flex-col items-center h-[80px] border-b border-slate-100">
          <div
            className="w-10 h-1 bg-slate-300 rounded-full mt-3 mb-2"
            aria-label="Drag to expand cart"
          />
          <div className="flex items-center justify-between w-full px-4 px-6">
            <span className="text-sm font-semibold text-slate-900">
              {getItemCount()} {getItemCount() === 1 ? "item" : "items"} in cart
            </span>
            {isExpanded && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex-1 overflow-y-auto p-4 pb-20 space-y-4"
            >
              {/* Cart Items */}
              {items.length > 0 ? (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200 rounded-xl"
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-1">
                  <svg className="w-12 h-12 mx-auto text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2h7a2 2 0 002-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M22 12h-4l-3 3m-5-3v12m-4-4l3 3m4-4H6a2 2 0 01-2-2V7a2 2 0 012-2h7a2 2 0 012 2v4" />
                  </svg>
                  <p className="text-sm font-medium">Cart is empty</p>
                  <p className="text-xs text-slate-400">Add items to get started</p>
                </div>
              )}

              {/* Totals & Controls */}
              {items.length > 0 && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  {/* Discount Input */}
                  <div className="space-y-2">
                    <label htmlFor="discount-input" className="text-xs font-medium text-slate-500">
                      Discount (Rs)
                    </label>
                    <input
                      id="discount-input"
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
                  <div className="flex items-center justify-between">
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
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}