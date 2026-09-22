"use client";

import { useMemo } from "react";
import { AlertTriangle, X } from "lucide-react";
import type { Product } from "@/types/product";
import { getStockStatus } from "@/hooks/products/useInventory";
import { cn } from "@/lib/utils";

interface InventoryAlertBannerProps {
  products: Product[];
  onDismiss?: () => void;
}

export function InventoryAlertBanner({ products, onDismiss }: InventoryAlertBannerProps) {
  const lowStockProducts = useMemo(
    () =>
      products.filter(
        (p) => getStockStatus(p) === "LOW" || getStockStatus(p) === "OUT"
      ),
    [products]
  );

  if (lowStockProducts.length === 0) return null;

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border animate-in slide-in-from-top-2 duration-300",
        "bg-yellow-50 border-yellow-200 text-yellow-800"
      )}
      role="alert"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <h2 className="font-bold text-base">Low Stock Alert</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
              {lowStockProducts.length} item{lowStockProducts.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ul className="space-y-1 text-sm max-h-40 overflow-y-auto">
            {lowStockProducts.map((product) => (
              <li key={product.id} className="flex items-center justify-between">
                <span className="truncate pr-2">{product.name}</span>
                <span
                  className={cn(
                    "font-mono font-medium px-2 py-0.5 rounded text-xs",
                    getStockStatus(product) === "OUT"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  )}
                >
                  {getStockStatus(product)}: {product.stock}
                </span>
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-yellow-100 text-yellow-500 hover:text-yellow-700 transition-colors"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}