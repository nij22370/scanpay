"use client";

import { useCallback, useState } from "react";
import { parse } from "papaparse";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/index";
import { Badge } from "@/components/ui/index";
import { AlertCircle, CheckCircle, XCircle, Upload, X } from "lucide-react";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

interface ParsedRow {
  name: string;
  name_np: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
  errors: string[];
}

interface CSVImportProps {
  onImport: (products: ParsedRow[]) => Promise<void>;
}

const REQUIRED_HEADERS = ["name", "category", "price", "stock"] as const;
const ALL_HEADERS = ["name", "name_np", "barcode", "price", "stock", "category"] as const;

function parseCSVWithPapa(csvText: string): ParsedRow[] {
  const result = parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
    transform: (value) => value.trim(),
  });

  return result.data.map((row, index) => {
    const parsed: ParsedRow = {
      name: "",
      name_np: "",
      barcode: "",
      price: 0,
      stock: 0,
      category: "",
      errors: [],
    };

    REQUIRED_HEADERS.forEach((header) => {
      const value = row[header];
      if (value === undefined || value === null || value === "") {
        parsed.errors.push(`Missing required field: ${header}`);
      }
    });

    ALL_HEADERS.forEach((header) => {
      const value = row[header];
      if (value !== undefined && value !== null && value !== "") {
        switch (header) {
          case "name":
            parsed.name = value;
            break;
          case "name_np":
            parsed.name_np = value;
            break;
          case "barcode":
            parsed.barcode = value;
            break;
          case "price":
            parsed.price = parseFloat(value) || 0;
            if (isNaN(parsed.price) || parsed.price < 0) {
              parsed.errors.push("Invalid price");
            }
            break;
          case "stock":
            parsed.stock = parseInt(value, 10) || 0;
            if (isNaN(parsed.stock) || parsed.stock < 0) {
              parsed.errors.push("Invalid stock");
            }
            break;
          case "category":
            parsed.category = value;
            break;
        }
      }
    });

    if (parsed.price < 0) parsed.errors.push("Price cannot be negative");
    if (parsed.stock < 0) parsed.errors.push("Stock cannot be negative");

    return parsed;
  });
}

export function CSVImport({ onImport }: CSVImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<ParsedRow[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please select a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSVWithPapa(text);
      setPreviewRows(parsed);
      setImportResult(null);
      setIsOpen(true);
    };
    reader.readAsText(file);
    event.target.value = "";
  }, []);

  const handleConfirmImport = useCallback(async () => {
    const validRows = previewRows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) return;

    setIsImporting(true);
    try {
      await onImport(validRows);
      setImportResult({ success: validRows.length, errors: [] });
      setPreviewRows([]);
      setIsOpen(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Import failed";
      setImportResult({ success: 0, errors: [message] });
    } finally {
      setIsImporting(false);
    }
  }, [previewRows, onImport]);

  const errorCount = previewRows.filter((r) => r.errors.length > 0).length;
  const validCount = previewRows.length - errorCount;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => document.getElementById("csv-import-input")?.click()}
        className="cursor-pointer h-10 px-4 flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        <span>Import CSV</span>
        <input
          id="csv-import-input"
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Import CSV file"
        />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Inventory CSV</DialogTitle>
            <DialogDescription>
              Preview parsed rows below. Only rows without errors will be imported.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Valid: {validCount}
                </Badge>
                {errorCount > 0 && (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Errors: {errorCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="max-h-[50vh] overflow-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">#</th>
                    <th className="px-3 py-2 text-left font-semibold">Name</th>
                    <th className="px-3 py-2 text-left font-semibold">Name (NP)</th>
                    <th className="px-3 py-2 text-left font-semibold">Barcode</th>
                    <th className="px-3 py-2 text-left font-semibold">Price</th>
                    <th className="px-3 py-2 text-left font-semibold">Stock</th>
                    <th className="px-3 py-2 text-left font-semibold">Category</th>
                    <th className="px-3 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewRows.map((row, index) => (
                    <tr key={index} className={row.errors.length > 0 ? "bg-red-50" : ""}>
                      <td className="px-3 py-2 font-mono text-muted-foreground">{index + 1}</td>
                      <td className="px-3 py-2 truncate max-w-[150px]">{row.name}</td>
                      <td className="px-3 py-2 truncate max-w-[150px] text-muted-foreground">{row.name_np || "—"}</td>
                      <td className="px-3 py-2 font-mono truncate max-w-[100px]">{row.barcode || "—"}</td>
                      <td className="px-3 py-2">Rs. {row.price.toFixed(2)}</td>
                      <td className="px-3 py-2 font-mono">{row.stock}</td>
                      <td className="px-3 py-2">{row.category}</td>
                      <td className="px-3 py-2">
                        {row.errors.length > 0 ? (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="w-3.5 h-3.5" />
                            <span className="truncate">{row.errors.join("; ")}</span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {previewRows.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No data parsed</div>
              )}
            </div>

            {importResult && (
              <div className="p-3 rounded-lg border flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {importResult.success > 0 ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">
                        Successfully imported {importResult.success} product{importResult.success !== 1 ? "s" : ""}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800">Import failed</span>
                    </>
                  )}
                </div>
                {importResult.errors.length > 0 && (
                  <div className="text-sm text-red-600 max-w-[300px] truncate">
                    {importResult.errors.join("; ")}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer h-10">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmImport}
              disabled={isImporting || validCount === 0}
              className="cursor-pointer h-10 flex items-center gap-2"
            >
              {isImporting && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Import {validCount} Product{validCount !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}