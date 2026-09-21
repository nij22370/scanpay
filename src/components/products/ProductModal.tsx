"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/index";
import { CreateProductSchema, type CreateProduct } from "@/validators/product.schema";
import type { Product } from "@/types/product";
import { useCreateProduct, useUpdateProduct } from "@/hooks/products/useProducts";
import { QRGenerator } from "@/components/codes/QRGenerator";
import { BarcodeGenerator } from "@/components/codes/BarcodeGenerator";
import { generateRandomEan12, buildProductQrData } from "@/utils/barcode";
import { cn } from "@/lib/utils";

const DEFAULT_LOW_STOCK_THRESHOLD = 10;
const MODAL_QR_SIZE_PX = 96;

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export function ProductModal({
  isOpen,
  onClose,
  productToEdit,
}: ProductModalProps) {
  const isEditMode = Boolean(productToEdit);
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  const [generatedBarcode, setGeneratedBarcode] = useState<string>(() =>
    generateRandomEan12()
  );

  const initialFormValues: CreateProduct = useMemo(() => {
    if (productToEdit) {
      return {
        name: productToEdit.name,
        name_np: productToEdit.name_np ?? "",
        price: productToEdit.price,
        category: productToEdit.category,
        stock: productToEdit.stock,
        low_stock_threshold:
          productToEdit.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
        vat_applicable: productToEdit.vat_applicable ?? false,
        barcode: productToEdit.barcode ?? "",
        qr_data: productToEdit.qr_data ?? "",
        image_url: productToEdit.image_url ?? "",
      };
    }

    return {
      name: "",
      name_np: "",
      price: 0,
      category: "",
      stock: 0,
      low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD,
      vat_applicable: false,
      barcode: generatedBarcode,
      qr_data: "",
      image_url: "",
    };
  }, [productToEdit, generatedBarcode]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProduct>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: initialFormValues,
  });

  const watchedName = watch("name");
  const watchedPrice = watch("price");
  const watchedBarcode = watch("barcode");
  const watchedVatApplicable = watch("vat_applicable");

  // Sync form defaults when productToEdit changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        reset({
          name: productToEdit.name,
          name_np: productToEdit.name_np ?? "",
          price: productToEdit.price,
          category: productToEdit.category,
          stock: productToEdit.stock,
          low_stock_threshold:
            productToEdit.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
          vat_applicable: productToEdit.vat_applicable ?? false,
          barcode: productToEdit.barcode ?? "",
          qr_data: productToEdit.qr_data ?? "",
          image_url: productToEdit.image_url ?? "",
        });
        setGeneratedBarcode(productToEdit.barcode ?? generateRandomEan12());
      } else {
        const freshBarcode = generateRandomEan12();
        setGeneratedBarcode(freshBarcode);
        reset({
          name: "",
          name_np: "",
          price: 0,
          category: "",
          stock: 0,
          low_stock_threshold: DEFAULT_LOW_STOCK_THRESHOLD,
          vat_applicable: false,
          barcode: freshBarcode,
          qr_data: "",
          image_url: "",
        });
      }
    }
  }, [isOpen, productToEdit, reset]);

  const handleRegenerateBarcode = useCallback(() => {
    const newBarcode = generateRandomEan12();
    setGeneratedBarcode(newBarcode);
    setValue("barcode", newBarcode);
  }, [setValue]);

  const handleToggleVat = useCallback(() => {
    setValue("vat_applicable", !watchedVatApplicable, { shouldDirty: true });
  }, [setValue, watchedVatApplicable]);

  const previewQrData = useMemo(() => {
    const previewId = productToEdit?.id ?? "preview-code";
    const validPrice = Number(watchedPrice) >= 0 ? Number(watchedPrice) : 0;
    return buildProductQrData({
      id: previewId,
      name: watchedName?.trim() || "Product Preview",
      price: validPrice,
    });
  }, [productToEdit?.id, watchedName, watchedPrice]);

  const isSubmitting =
    createProductMutation.isPending || updateProductMutation.isPending;

  const handleFormSubmit = useCallback(
    async (formData: CreateProduct) => {
      try {
        if (isEditMode && productToEdit) {
          await updateProductMutation.mutateAsync({
            id: productToEdit.id,
            name: formData.name.trim(),
            name_np: formData.name_np?.trim() || null,
            price: formData.price,
            category: formData.category.trim(),
            stock: formData.stock,
            low_stock_threshold: formData.low_stock_threshold,
            vat_applicable: formData.vat_applicable,
            barcode: formData.barcode?.trim() || generatedBarcode,
            qr_data: previewQrData,
            image_url: formData.image_url?.trim() || null,
          });
        } else {
          await createProductMutation.mutateAsync({
            ...formData,
            barcode: formData.barcode?.trim() || generatedBarcode,
            qr_data: previewQrData,
          });
        }
        onClose();
      } catch (submitError: unknown) {
        // Handled by react-query error states
      }
    },
    [
      isEditMode,
      productToEdit,
      updateProductMutation,
      createProductMutation,
      generatedBarcode,
      previewQrData,
      onClose,
    ]
  );

  const activeBarcodeForPreview =
    watchedBarcode?.trim() || generatedBarcode || "200000000000";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update product catalog details, pricing, and stock limits."
              : "Create a new catalog item with automatically generated EAN-13 barcode and QR code."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="product-modal-form"
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5"
        >
          {/* Main Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="product-name-input"
                className="text-sm font-medium text-slate-700"
              >
                Product Name (English) *
              </label>
              <input
                id="product-name-input"
                type="text"
                placeholder="e.g. Masala Tea"
                {...register("name")}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm",
                  "focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.name && "border-red-500"
                )}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Nepali Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="product-name-np-input"
                className="text-sm font-medium text-slate-700"
              >
                Product Name (Nepali){" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="product-name-np-input"
                type="text"
                placeholder="e.g. मसला चिया"
                {...register("name_np")}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="product-category-input"
                className="text-sm font-medium text-slate-700"
              >
                Category *
              </label>
              <input
                id="product-category-input"
                type="text"
                placeholder="e.g. Beverages, Bakery, Snacks"
                {...register("category")}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm",
                  "focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.category && "border-red-500"
                )}
              />
              {errors.category && (
                <p className="text-xs text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label
                htmlFor="product-price-input"
                className="text-sm font-medium text-slate-700"
              >
                Price (Rs) *
              </label>
              <input
                id="product-price-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("price")}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm",
                  "focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.price && "border-red-500"
                )}
              />
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>

            {/* Stock */}
            <div className="space-y-1.5">
              <label
                htmlFor="product-stock-input"
                className="text-sm font-medium text-slate-700"
              >
                Initial Stock *
              </label>
              <input
                id="product-stock-input"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                {...register("stock")}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm",
                  "focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent",
                  errors.stock && "border-red-500"
                )}
              />
              {errors.stock && (
                <p className="text-xs text-red-600">{errors.stock.message}</p>
              )}
            </div>

            {/* Low Stock Threshold */}
            <div className="space-y-1.5">
              <label
                htmlFor="product-threshold-input"
                className="text-sm font-medium text-slate-700"
              >
                Low Stock Threshold (default: 10)
              </label>
              <input
                id="product-threshold-input"
                type="number"
                step="1"
                min="0"
                placeholder="10"
                {...register("low_stock_threshold")}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Product Image URL */}
            <div className="space-y-1.5 md:col-span-2">
              <label
                htmlFor="product-image-url-input"
                className="text-sm font-medium text-slate-700"
              >
                Product Image URL{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                id="product-image-url-input"
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                {...register("image_url")}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {/* VAT Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800">
                13% VAT Applicable
              </span>
              <span className="text-xs text-slate-500">
                Include standard Nepal 13% Value Added Tax in checkout
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleVat}
              className={cn(
                "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                watchedVatApplicable ? "bg-primary" : "bg-slate-300"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                  watchedVatApplicable ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          {/* Auto-Generated Codes Preview */}
          <div className="rounded-xl border border-dashed border-teal-300 bg-teal-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">
                  qr_code_2
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  {isEditMode ? "Assigned Codes" : "Auto-Generated Code Preview"}
                </span>
              </div>
              {!isEditMode && (
                <button
                  type="button"
                  onClick={handleRegenerateBarcode}
                  className="flex items-center gap-1 text-xs text-primary font-medium hover:underline cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">
                    refresh
                  </span>
                  Regenerate Barcode
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center justify-items-center pt-1">
              {/* Mini QR Preview */}
              <div className="flex flex-col items-center gap-1.5">
                <QRGenerator
                  data={previewQrData}
                  size={MODAL_QR_SIZE_PX}
                  hideDownload
                  className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs w-auto md:w-auto"
                />
                <span className="text-[11px] font-mono text-slate-500">
                  QR: &#123;id, name, price&#125;
                </span>
              </div>

              {/* Barcode Preview */}
              <div className="flex flex-col items-center gap-1.5 w-full">
                <div className="w-full flex justify-center bg-white border border-slate-200 rounded-xl p-2 shadow-xs">
                  <BarcodeGenerator
                    data={activeBarcodeForPreview}
                    type="ean13"
                    hideDownload
                    className="p-1 border-0 shadow-none w-full md:w-auto bg-transparent"
                  />
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  EAN-13: {activeBarcodeForPreview}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer h-12 bg-primary text-white hover:bg-primary/90 flex items-center gap-2"
            >
              {isSubmitting && (
                <span className="material-symbols-outlined text-base animate-spin">
                  progress_activity
                </span>
              )}
              <span className="material-symbols-outlined text-base">
                {isEditMode ? "save" : "add_circle"}
              </span>
              <span>{isEditMode ? "Save Changes" : "Create Product"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
