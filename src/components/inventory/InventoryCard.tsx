"use client";

import { useCallback } from "react";
import { Minus, Plus, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/index";
import { Badge } from "@/components/ui/index";
import type { Product } from "@/types/product";
import { useUpdateStock, getStockStatus } from "@/hooks/products/useInventory";
import { cn } from "@/lib/utils";

interface InventoryCardProps {
  product: Product;
}

const STATUS_CONFIG: Record<
  ReturnType<typeof getStockStatus>,
  { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode; label: string }
> = {
  OK: {
    variant: "secondary",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    label: "In Stock",
  },
  LOW: {
    variant: "default",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    label: "Low Stock",
  },
  OUT: {
    variant: "destructive",
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Out of Stock",
  },
};

export function InventoryCard({ product }: InventoryCardProps) {
  const updateStock = useUpdateStock();
  const status = getStockStatus(product);
  const config = STATUS_CONFIG[status];

  const handleAdjust = useCallback(
    (delta: number) => {
      const newStock = Math.max(0, product.stock + delta);
      updateStock.mutate({ id: product.id, stock: newStock });
    },
    [product.id, product.stock, updateStock]
  );

  const handleCustomStock = useCallback(
    (value: string) => {
      const stock = Math.max(0, parseInt(value, 10) || 0);
      updateStock.mutate({ id: product.id, stock });
    },
    [product.id, updateStock]
  );

  return (
    <div
      className={cn(
        "p-4 border rounded-lg space-y-3 transition-colors",
        status === "OUT" && "border-red-300 bg-red-50",
        status === "LOW" && "border-yellow-300 bg-yellow-50",
        status === "OK" && "border-green-300 bg-green-50"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{product.name}</h3>
          {product.name_np && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {product.name_np}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant={config.variant} className="gap-1 text-xs">
            {config.icon}
            {config.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <span className="text-muted-foreground block">Category</span>
          <span className="font-medium">{product.category}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Threshold</span>
          <span className="font-mono font-medium">{product.low_stock_threshold ?? 10}</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Current Stock</span>
          <input
            type="number"
            min="0"
            step="1"
            value={product.stock}
            onChange={(e) => handleCustomStock(e.target.value)}
            onBlur={(e) => handleCustomStock(e.target.value)}
            className="w-full px-2 py-1 text-sm border rounded text-center font-mono focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={`Stock for ${product.name}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAdjust(-1)}
            disabled={product.stock <= 0}
            className="h-9 w-9 cursor-pointer"
            aria-label={`Decrease stock for ${product.name}`}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleAdjust(1)}
            className="h-9 w-9 cursor-pointer"
            aria-label={`Increase stock for ${product.name}`}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          Barcode: {product.barcode ?? "—"}
        </span>
      </div>
    </div>
  );
}