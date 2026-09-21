"use client";

import { Product } from "@/types";
import { motion } from "framer-motion";
import { Minus, Plus, AlertCircle } from "lucide-react";

interface InventoryItemProps {
  product: Product;
}

export function InventoryItem({ product }: InventoryItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 border rounded-lg space-y-2 ${
        product.stock <= 5 ? "border-red-300 bg-red-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{product.name}</h3>
        {product.stock <= 5 && <AlertCircle className="w-4 h-4 text-red-500" />}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Stock</span>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-accent">
            <Minus className="w-4 h-4" />
          </button>
          <span className={`font-bold ${product.stock <= 5 ? "text-red-600" : ""}`}>
            {product.stock}
          </span>
          <button className="p-1 rounded hover:bg-accent">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Price: Rs. {product.price}</span>
        <span>Category: {product.category}</span>
      </div>
    </motion.div>
  );
}
