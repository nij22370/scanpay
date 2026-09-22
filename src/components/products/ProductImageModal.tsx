/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button, Badge } from "@/components/ui/index";
import type { Product } from "@/types/product";

interface ProductImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onEdit?: (product: Product) => void;
}

export function ProductImageModal({
  isOpen,
  onClose,
  product,
  onEdit,
}: ProductImageModalProps) {
  const lowStockLimit = product?.low_stock_threshold ?? 10;
  const isLowStock = product ? product.stock <= lowStockLimit : false;

  const handleEditClick = useCallback(() => {
    onClose();
    if (onEdit && product) {
      onEdit(product);
    }
  }, [onClose, onEdit, product]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Full Image Header Container */}
        <div className="relative w-full bg-slate-950 flex items-center justify-center min-h-[300px] h-[360px] md:h-[440px] p-2">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-slate-400 py-12">
              <span className="material-symbols-outlined text-6xl">
                package_2
              </span>
              <span className="text-sm font-medium">No Image Available</span>
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="p-5 space-y-4">
          <DialogHeader className="p-0 space-y-1 text-left">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                {product.category}
              </span>
              {product.vat_applicable && (
                <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
                  13% VAT
                </span>
              )}
            </div>

            <DialogTitle className="text-xl font-bold text-slate-900 leading-snug">
              {product.name}
            </DialogTitle>

            {product.name_np && (
              <DialogDescription className="text-sm text-slate-500 font-sans">
                {product.name_np}
              </DialogDescription>
            )}
          </DialogHeader>

          {/* Pricing & Stock Details */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
            <div>
              <span className="text-xs text-slate-400 block font-medium">
                Price
              </span>
              <span className="text-xl font-bold text-slate-900">
                Rs. {product.price.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col items-end justify-center">
              <span className="text-xs text-slate-400 block font-medium mb-1">
                Stock Status
              </span>
              {isLowStock ? (
                <Badge
                  variant="destructive"
                  className="bg-red-50 text-red-700 border-red-200 font-semibold px-2.5 py-1 text-xs"
                >
                  Low Stock: {product.stock}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2.5 py-1 text-xs"
                >
                  In Stock: {product.stock}
                </Badge>
              )}
            </div>
          </div>

          {/* Barcode metadata */}
          {product.barcode && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white border border-slate-200 p-2.5 rounded-xl">
              <span className="material-symbols-outlined text-base text-slate-400">
                barcode
              </span>
              <span>EAN-13: {product.barcode}</span>
            </div>
          )}

          <DialogFooter className="pt-2 flex items-center justify-end gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                onClick={handleEditClick}
                className="cursor-pointer h-10 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 font-medium text-xs rounded-xl"
              >
                <span className="material-symbols-outlined text-base">
                  edit
                </span>
                <span>Edit Product</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={onClose}
              className="cursor-pointer h-10 px-5 bg-primary text-white hover:bg-primary/90 font-medium text-xs rounded-xl"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
