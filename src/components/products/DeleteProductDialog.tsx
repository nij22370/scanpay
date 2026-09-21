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
import { Button } from "@/components/ui/index";
import type { Product } from "@/types/product";
import { useDeleteProduct } from "@/hooks/products/useProducts";

interface DeleteProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function DeleteProductDialog({
  isOpen,
  onClose,
  product,
}: DeleteProductDialogProps) {
  const deleteMutation = useDeleteProduct();

  const handleDelete = useCallback(async () => {
    if (!product) return;
    try {
      await deleteMutation.mutateAsync(product.id);
      onClose();
    } catch (error: unknown) {
      // Handled by react-query error states
    }
  }, [product, deleteMutation, onClose]);

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <span className="material-symbols-outlined text-2xl">
              warning
            </span>
            Delete Product
          </DialogTitle>
          <DialogDescription className="pt-2 text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              &quot;{product.name}&quot;
            </span>
            ? This action cannot be undone and will remove the item from the catalog.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer h-12"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            className="cursor-pointer h-12 flex items-center gap-2"
          >
            {deleteMutation.isPending && (
              <span className="material-symbols-outlined text-base animate-spin">
                progress_activity
              </span>
            )}
            <span className="material-symbols-outlined text-base">delete</span>
            <span>Delete Product</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
