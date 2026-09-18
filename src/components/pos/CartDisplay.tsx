"use client";

import { useCartStore } from "@/store";
import { Trash2, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CartDisplay() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalAmount = useCartStore((s) => s.totalAmount);
  const totalItems = useCartStore((s) => s.totalItems);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-bold">
        <span>Items in cart</span>
        <span>{totalItems()}</span>
      </div>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={item.productId}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex items-center justify-between p-2 border rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">Rs. {item.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                className="p-1 rounded hover:bg-accent"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                className="p-1 rounded hover:bg-accent"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeItem(item.productId)}
                className="p-1 rounded hover:bg-destructive/20"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
            <div className="font-bold w-20 text-right">
              Rs. {item.price * item.quantity}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex items-center justify-between text-lg font-bold pt-4 border-t">
        <span>Total</span>
        <span>Rs. {totalAmount()}</span>
      </div>
      {items.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Cart is empty</p>
      )}
    </div>
  );
}
