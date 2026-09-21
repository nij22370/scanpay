/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge, Skeleton } from "@/components/ui/index";
import { useProducts } from "@/hooks/products/useProducts";
import { ProductModal } from "@/components/products/ProductModal";
import { DeleteProductDialog } from "@/components/products/DeleteProductDialog";
import { ProductImageModal } from "@/components/products/ProductImageModal";
import { QRGenerator } from "@/components/codes/QRGenerator";
import { buildProductQrData } from "@/utils/barcode";
import type { Product } from "@/types/product";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORY_ALL = "all";
const CARD_QR_SIZE_PX = 80;
const DEFAULT_LOW_STOCK_THRESHOLD = 10;

export default function ProductsPage() {
  const { data: products = [], isLoading, isError, error } = useProducts();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] =
    useState<string>(DEFAULT_CATEGORY_ALL);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Delete dialog state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);

  // Image preview modal state
  const [productForImagePreview, setProductForImagePreview] =
    useState<Product | null>(null);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState<boolean>(false);

  // Extract unique categories from product list
  const categoryList = useMemo(() => {
    const categoriesSet = new Set<string>();
    products.forEach((product) => {
      if (product.category && product.category.trim()) {
        categoriesSet.add(product.category.trim());
      }
    });
    return [DEFAULT_CATEGORY_ALL, ...Array.from(categoriesSet)];
  }, [products]);

  // Client-side filtering by name and category
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchTerm.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.name_np &&
          product.name_np.toLowerCase().includes(normalizedQuery));

      const matchesCategory =
        selectedCategory === DEFAULT_CATEGORY_ALL ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  }, []);

  const handleCloseProductModal = useCallback(() => {
    setIsProductModalOpen(false);
    setProductToEdit(null);
  }, []);

  const handleOpenEditModal = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  }, []);

  const handleOpenImagePreview = useCallback((product: Product) => {
    setProductForImagePreview(product);
    setIsImagePreviewOpen(true);
  }, []);

  const handleCloseImagePreview = useCallback(() => {
    setIsImagePreviewOpen(false);
    setProductForImagePreview(null);
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Product Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage inventory items, barcodes, and dynamic QR payment data
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="cursor-pointer h-11 px-5 bg-primary text-white hover:bg-primary/90 rounded-xl flex items-center gap-2 font-medium shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>Add Product</span>
        </Button>
      </div>

      {/* Controls Bar: Search + Category Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className={cn(
              "w-full h-12 pl-11 pr-10 rounded-xl border border-slate-200 bg-white text-sm",
              "focus:outline-hidden focus:ring-2 focus:ring-primary focus:border-transparent",
              "placeholder:text-slate-400 shadow-xs"
            )}
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Category Tabs */}
        {categoryList.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryList.map((category) => {
              const isSelected = selectedCategory === category;
              const label =
                category === DEFAULT_CATEGORY_ALL ? "All Categories" : category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleSelectCategory(category)}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer shrink-0",
                    isSelected
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg text-red-600">
            error
          </span>
          <span>
            Failed to load products:{" "}
            {error instanceof Error ? error.message : "Unknown error"}
          </span>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
                <Skeleton className="h-[80px] w-[80px] rounded-lg" />
              </div>
              <Skeleton className="h-6 w-1/3 rounded-md" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 flex-1 rounded-xl" />
                <Skeleton className="h-10 flex-1 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredProducts.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[320px] rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-3xl text-slate-400">
              inventory_2
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            No products found
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            {searchTerm || selectedCategory !== DEFAULT_CATEGORY_ALL
              ? "No items match your active filters. Try adjusting your search query or selected category."
              : "Get started by adding your first product to the catalog with automatic barcode and QR generation."}
          </p>
          <Button
            onClick={handleOpenAddModal}
            className="mt-4 cursor-pointer bg-primary text-white hover:bg-primary/90 rounded-xl flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">
              add_circle
            </span>
            <span>Add New Product</span>
          </Button>
        </div>
      )}

      {/* Product Grid: mobile = 1 col, md = 2 col, lg = 3 col */}
      {!isLoading && filteredProducts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredProducts.map((product) => {
              const lowStockLimit =
                product.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
              const isLowStock = product.stock <= lowStockLimit;
              const qrPayload =
                product.qr_data ||
                buildProductQrData({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                });

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Hero Image Section (Large, Clickable for Preview) */}
                    <button
                      type="button"
                      onClick={() => handleOpenImagePreview(product)}
                      className="relative w-full h-44 rounded-xl overflow-hidden cursor-pointer group focus:outline-hidden focus:ring-2 focus:ring-primary/50 border border-slate-200 bg-slate-50 shrink-0"
                      title="Click to view full image"
                    >
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-teal-50/60 flex flex-col items-center justify-center text-primary gap-1 group-hover:bg-teal-100/60 transition-colors">
                          <span className="material-symbols-outlined text-4xl">
                            package_2
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            No image provided
                          </span>
                        </div>
                      )}

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap pointer-events-none">
                        <span className="px-2.5 py-0.5 rounded-lg bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold shadow-xs border border-slate-200/50">
                          {product.category}
                        </span>
                        {product.vat_applicable && (
                          <span className="px-2 py-0.5 rounded-lg bg-teal-600/90 backdrop-blur-md text-white text-[10px] font-semibold shadow-xs">
                            13% VAT
                          </span>
                        )}
                      </div>

                      {/* Hover Overlay Hint */}
                      <div className="absolute inset-0 bg-slate-900/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1.5 font-medium text-xs">
                        <span className="material-symbols-outlined text-xl">
                          zoom_in
                        </span>
                        <span>View Full Image</span>
                      </div>
                    </button>

                    {/* Middle Section: Name (Left) + Mini QR (Right) */}
                    <div className="flex items-start justify-between gap-3 pt-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-slate-900 leading-snug break-words">
                          {product.name}
                        </h3>
                        {product.name_np && (
                          <p className="text-xs text-slate-500 break-words mt-0.5 font-sans">
                            {product.name_np}
                          </p>
                        )}
                      </div>

                      {/* Mini QR preview (80px) */}
                      <div className="shrink-0">
                        <QRGenerator
                          data={qrPayload}
                          size={CARD_QR_SIZE_PX}
                          hideDownload
                          className="p-1 bg-white border border-slate-200 rounded-xl shadow-none w-[80px] h-[80px] shrink-0 flex items-center justify-center"
                        />
                      </div>
                    </div>

                    {/* Price & Stock Badge Row */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">
                          Price
                        </span>
                        <span className="text-lg font-bold text-slate-900">
                          Rs. {product.price.toFixed(2)}
                        </span>
                      </div>

                      <div>
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

                    {/* Barcode details */}
                    {product.barcode && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono pt-0.5">
                        <span className="material-symbols-outlined text-sm text-slate-400">
                          barcode
                        </span>
                        <span>{product.barcode}</span>
                      </div>
                    )}
                  </div>

                  {/* Compact Bottom Action Bar */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenEditModal(product)}
                      className="h-9 px-3.5 rounded-xl text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-1.5 font-medium text-xs flex-1 sm:flex-initial"
                    >
                      <span className="material-symbols-outlined text-base">
                        edit
                      </span>
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenDeleteDialog(product)}
                      className="h-9 px-3 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer flex items-center justify-center gap-1 text-xs"
                    >
                      <span className="material-symbols-outlined text-base">
                        delete
                      </span>
                      <span>Delete</span>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        productToEdit={productToEdit}
      />

      {/* Confirmation Delete Dialog */}
      <DeleteProductDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        product={productToDelete}
      />

      {/* Full Image Preview Modal */}
      <ProductImageModal
        isOpen={isImagePreviewOpen}
        onClose={handleCloseImagePreview}
        product={productForImagePreview}
        onEdit={handleOpenEditModal}
      />
    </div>
  );
}
