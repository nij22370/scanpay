"use client";

import { useCallback, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { InventoryAlertBanner } from "@/components/inventory/InventoryAlertBanner";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryCard } from "@/components/inventory/InventoryCard";
import { BulkUpdateModal } from "@/components/inventory/BulkUpdateModal";
import { CSVExportButton } from "@/components/inventory/CSVExportButton";
import { CSVImport } from "@/components/inventory/CSVImport";
import { InventoryTableSkeleton } from "@/components/inventory/InventoryTableSkeleton";
import { useInventory } from "@/hooks/products/useInventory";
import { cn } from "@/lib/utils";

const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export default function InventoryPage() {
  const { data: products = [], isLoading, isError, error, refetch } = useInventory();
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [dismissedAlert, setDismissedAlert] = useState(false);

  const lowStockProducts = products.filter(
    (p) => p.stock <= (p.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD) && p.stock > 0
  );
  const outOfStockProducts = products.filter((p) => p.stock <= 0);

  const handleBulkImport = useCallback(async (rows: Array<{
    name: string;
    name_np: string;
    barcode: string;
    price: number;
    stock: number;
    category: string;
  }>) => {
    const { supabase } = await import("@/lib/supabase");
    const { generateRandomEan12, buildProductQrData } = await import("@/utils/barcode");

    const payload = rows.map((row) => ({
      id: crypto.randomUUID(),
      name: row.name,
      name_np: row.name_np || null,
      price: row.price,
      category: row.category,
      stock: row.stock,
      low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD,
      vat_applicable: false,
      barcode: row.barcode || generateRandomEan12(),
      qr_data: buildProductQrData({
        id: crypto.randomUUID(),
        name: row.name,
        price: row.price,
      }),
      image_url: null,
    }));

    const { error } = await supabase.from("products").upsert(payload, { onConflict: "barcode" });

    if (error) {
      throw new Error(error.message || "Failed to import products");
    }
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <InventoryTableSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Failed to load inventory</p>
            <p className="text-xs mt-1">{error instanceof Error ? error.message : "Unknown error"}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer flex-shrink-0"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Inventory Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor stock levels, adjust quantities, and manage bulk updates
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CSVExportButton products={products} />
          <CSVImport onImport={handleBulkImport} />
        </div>
      </div>

      {!dismissedAlert && (lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <InventoryAlertBanner
          products={products}
          onDismiss={() => setDismissedAlert(true)}
        />
      )}

      <div className="hidden md:block">
        <InventoryTable products={products} onBulkUpdateOpen={() => setIsBulkUpdateOpen(true)} />
      </div>

      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <InventoryCard key={product.id} product={product} />
        ))}
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

      <BulkUpdateModal
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        products={products}
      />
    </div>
  );
}