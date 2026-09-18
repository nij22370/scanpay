"use client";

import { InventoryItem } from "@/components/inventory/InventoryItem";
import { useProducts } from "@/hooks";
import { LowStockAlerts } from "@/components/pos/LowStockAlerts";

export function InventoryPage() {
  const { data: products, isLoading } = useProducts();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Inventory</h1>
      <LowStockAlerts />
      {isLoading && <div>Loading inventory...</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products?.map((product) => (
          <InventoryItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
