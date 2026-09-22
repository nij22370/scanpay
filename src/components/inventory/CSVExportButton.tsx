"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/index";
import { Download } from "lucide-react";
import type { Product } from "@/types/product";

interface CSVExportButtonProps {
  products: Product[];
  filename?: string;
}

const CSV_HEADERS = [
  "name",
  "name_np",
  "barcode",
  "price",
  "stock",
  "category",
] as const;

function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function productToCsvRow(product: Product): string {
  return CSV_HEADERS.map((header) => {
    const value = product[header];
    return escapeCsvValue(String(value ?? ""));
  }).join(",");
}

export function CSVExportButton({ products, filename = "inventory" }: CSVExportButtonProps) {
  const handleExport = useCallback(() => {
    const csvContent = [
      CSV_HEADERS.join(","),
      ...products.map(productToCsvRow),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [products, filename]);

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      className="cursor-pointer h-10 px-4 flex items-center gap-2"
    >
      <Download className="w-4 h-4" />
      <span>Export CSV</span>
    </Button>
  );
}