"use client";

import { useCallback, useMemo } from "react";
import { Minus, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/index";
import { Badge } from "@/components/ui/index";
import type { Product } from "@/types/product";
import { useUpdateStock, getStockStatus } from "@/hooks/products/useInventory";
import { cn } from "@/lib/utils";

interface InventoryTableProps {
  products: Product[];
  onBulkUpdateOpen: () => void;
}

const STATUS_BADGE_VARIANTS: Record<
  ReturnType<typeof getStockStatus>,
  { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
> = {
  OK: { variant: "secondary", label: "OK" },
  LOW: { variant: "default", label: "LOW" },
  OUT: { variant: "destructive", label: "OUT" },
};

export function InventoryTable({ products, onBulkUpdateOpen }: InventoryTableProps) {
  const updateStock = useUpdateStock();

  const handleAdjust = useCallback(
    (productId: string, delta: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      const newStock = Math.max(0, product.stock + delta);
      updateStock.mutate({ id: productId, stock: newStock });
    },
    [products, updateStock]
  );

  const handleCustomStock = useCallback(
    (productId: string, value: string) => {
      const stock = Math.max(0, parseInt(value, 10) || 0);
      updateStock.mutate({ id: productId, stock });
    },
    [updateStock]
  );

  const columns = useMemo(
    () => [
      { key: "name", header: "Product Name", width: "30%" },
      { key: "category", header: "Category", width: "15%" },
      { key: "stock", header: "Current Stock", width: "15%" },
      { key: "threshold", header: "Threshold", width: "12%" },
      { key: "status", header: "Status", width: "12%" },
      { key: "actions", header: "Quick Adjust", width: "16%" },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Inventory</h2>
        <Button
          variant="outline"
          onClick={onBulkUpdateOpen}
          className="cursor-pointer h-10 px-4 flex items-center gap-2"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>Bulk Update</span>
        </Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm truncate max-w-xs">{product.name}</div>
                  {product.name_np && (
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                      {product.name_np}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {product.category}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={product.stock}
                    onChange={(e) => handleCustomStock(product.id, e.target.value)}
                    onBlur={(e) => handleCustomStock(product.id, e.target.value)}
                    className="w-20 px-2 py-1 text-sm border rounded text-center focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label={`Stock for ${product.name}`}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-mono text-muted-foreground">
                  {product.low_stock_threshold ?? 10}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={STATUS_BADGE_VARIANTS[getStockStatus(product)].variant}
                    className="text-xs"
                  >
                    {STATUS_BADGE_VARIANTS[getStockStatus(product)].label}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAdjust(product.id, -1)}
                      disabled={product.stock <= 0}
                      className="h-8 w-8 cursor-pointer"
                      aria-label={`Decrease stock for ${product.name}`}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleAdjust(product.id, 1)}
                      className="h-8 w-8 cursor-pointer"
                      aria-label={`Increase stock for ${product.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="font-medium">All stock levels are healthy</p>
          <p className="text-sm mt-1">No products are currently low or out of stock</p>
        </div>
      )}
    </div>
  );
}