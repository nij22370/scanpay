"use client";

import { useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/index";
import { Input } from "@/components/ui/index";
import type { Product } from "@/types/product";
import { useBulkUpdateStock, getStockStatus } from "@/hooks/products/useInventory";
import { cn } from "@/lib/utils";

interface BulkUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

export function BulkUpdateModal({ isOpen, onClose, products }: BulkUpdateModalProps) {
  const bulkUpdate = useBulkUpdateStock();

  const [localStocks, setLocalStocks] = useState<Record<string, number>>(() =>
    products.reduce((acc, p) => ({ ...acc, [p.id]: p.stock }), {})
  );

  const handleStockChange = useCallback((productId: string, value: string) => {
    const stock = Math.max(0, parseInt(value, 10) || 0);
    setLocalStocks((prev) => ({ ...prev, [productId]: stock }));
  }, []);

  const handleSave = useCallback(async () => {
    const updates = products.map((p) => ({
      id: p.id,
      stock: localStocks[p.id] ?? p.stock,
    }));

    try {
      await bulkUpdate.mutateAsync(updates);
      onClose();
    } catch (error) {
      // Error handled by react-query
    }
  }, [products, localStocks, bulkUpdate, onClose]);

  const sortedProducts = useMemo(
    () =>
      [...products].sort((a, b) => {
        const statusA = getStockStatus(a);
        const statusB = getStockStatus(b);
        const priority = { OUT: 0, LOW: 1, OK: 2 };
        return priority[statusA] - priority[statusB];
      }),
    [products]
  );

  const hasChanges = useMemo(
    () =>
      products.some((p) => localStocks[p.id] !== p.stock),
    [products, localStocks]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Stock Update</DialogTitle>
          <DialogDescription>
            Adjust stock levels for multiple products at once. Changes will be saved together.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {sortedProducts.map((product) => {
            const status = getStockStatus(product);
            const isLowOrOut = status !== "OK";
            return (
              <div
                key={product.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  isLowOrOut && "bg-yellow-50 border-yellow-200",
                  status === "OUT" && "bg-red-50 border-red-200"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{product.name}</span>
                    {product.name_np && (
                      <span className="text-xs text-muted-foreground">({product.name_np})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="font-mono">{product.barcode ?? "—"}</span>
                    <span>Category: {product.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-20 text-right text-sm font-mono text-muted-foreground">
                    Threshold: {product.low_stock_threshold ?? 10}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={localStocks[product.id] ?? product.stock}
                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                    className="w-24 text-center text-sm font-mono"
                    aria-label={`Stock for ${product.name}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer h-10"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={bulkUpdate.isPending || !hasChanges}
            onClick={handleSave}
            className="cursor-pointer h-10 flex items-center gap-2"
          >
            {bulkUpdate.isPending && (
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            Save All Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}