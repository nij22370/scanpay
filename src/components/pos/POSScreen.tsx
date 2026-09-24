"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store";
import { usePOSStore } from "@/store";
import { CartSheet } from "./CartSheet";
import { CartPanel } from "./CartPanel";
import { ProductSearch } from "./ProductSearch";
import { QRDisplay } from "@/components/codes/QRDisplay";
import { BarcodeDisplay } from "@/components/codes/BarcodeDisplay";
import { usePaymentMutation } from "@/hooks/usePayment";
import { useCreateTransaction } from "@/hooks";
import { useToast } from "@/hooks/useToast";
import { useProducts } from "@/hooks/products/useProducts";
import { DynamicBarcodeScanner } from "./DynamicBarcodeScanner";
import { useAuthStore } from "@/store";
import { convertToBS } from "@/lib/nepali-date";
import { supabase } from "@/lib/supabase";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentModal } from "./PaymentModal";
import type { Product } from "@/types/product";
import { ShoppingBag, Plus, Search, Camera, X } from "lucide-react";

const CODE_SECTION_ANIMATION = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto" },
  exit: { opacity: 0, height: 0 },
};

const QR_CODE_SIZE_PX = 200;

export function POSScreen() {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const selectedPaymentMethod = usePOSStore((s) => s.selectedPaymentMethod);
  const setPaymentMethod = usePOSStore((s) => s.setPaymentMethod);
  const isPaymentProcessing = usePOSStore((s) => s.isPaymentProcessing);
  const clearCart = useCartStore((s) => s.clearCart);
  const setLastTransactionId = usePOSStore((s) => s.setLastTransactionId);
  const { addToast } = useToast();
  const cashierName = useAuthStore((s: { cashierName: string | null }) => s.cashierName);

  const [isCodeSectionVisible, setIsCodeSectionVisible] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const createTransaction = useCreateTransaction();
  const paymentMutation = usePaymentMutation(
    selectedPaymentMethod as "esewa" | "khalti" | "fonepay"
  );

  const qrPayload = useMemo(() => {
    return `scanpay:${selectedPaymentMethod}:${getSubtotal()}`;
  }, [selectedPaymentMethod, getSubtotal]);

  const barcodePayload = useMemo(() => {
    return `SCANPAY-${Date.now()}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isPayButtonDisabled = useMemo(() => {
    return (
      isPaymentProcessing ||
      items.length === 0 ||
      !selectedPaymentMethod ||
      getSubtotal() === 0
    );
  }, [isPaymentProcessing, items.length, selectedPaymentMethod, getSubtotal]);

  const handleToggleCodeSection = useCallback(() => {
    setIsCodeSectionVisible((previousState) => !previousState);
  }, []);

  const handleScannerResult = useCallback(
    async (barcode: string) => {
      setIsScannerOpen(false);
      try {
        const { data: product, error } = await supabase
          .from("products")
          .select("*")
          .eq("barcode", barcode)
          .single();

        if (error || !product) {
          addToast("Product not found", "error");
          return;
        }

        const typedProduct = product as Product;
        if (typedProduct.stock <= 0) {
          addToast(`${typedProduct.name} is out of stock`, "error");
          return;
        }

        addItem(typedProduct);
        addToast(`Added: ${typedProduct.name}`, "success");
      } catch {
        addToast("Product not found. Tap to add manually.", "error");
      }
    },
    [addItem, addToast]
  );

  const handleProductSelect = useCallback(
    (product: Product) => {
      if (product.stock <= 0) {
        addToast(`${product.name} is out of stock`, "error");
        return;
      }
      addItem(product);
      addToast(`Added: ${product.name}`, "success");
    },
    [addItem, addToast]
  );

  const handlePayment = useCallback(async () => {
    if (!selectedPaymentMethod) return;
    const result = await paymentMutation.mutateAsync({
      amount: getSubtotal(),
      transactionId: crypto.randomUUID(),
    });
    if (result.transactionId) {
      setLastTransactionId(result.transactionId);
      clearCart();
    }
  }, [selectedPaymentMethod, paymentMutation, getSubtotal, setLastTransactionId, clearCart]);

  const handleOpenPaymentModal = useCallback(() => {
    if (items.length === 0) {
      addToast("Add items to cart first", "error");
      return;
    }
    const outOfStockItems = items.filter((item) => item.product.stock <= 0);
    if (outOfStockItems.length > 0) {
      addToast(`Stock warning: ${outOfStockItems.map((i) => i.product.name).join(", ")} ${outOfStockItems.length === 1 ? "is" : "are"} out of stock`, "error");
    }
    setIsPaymentModalOpen(true);
  }, [items, addToast]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "F2") {
        event.preventDefault();
        handleOpenPaymentModal();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenPaymentModal]);

  return (
    <div className="flex flex-col h-full">
      {/* Toast Provider will be at app level */}

      {/* Mobile Cart Sheet */}
      <CartSheet
        isOpen={isMobile && items.length > 0}
        onClose={() => {}}
        onPay={handleOpenPaymentModal}
      />

      {/* Scanner Modal */}
      <AnimatePresence>
        {isScannerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsScannerOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Barcode scanner"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md mx-4 bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Scan Barcode</h2>
                <button
                  onClick={() => setIsScannerOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Close scanner"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <DynamicBarcodeScanner
                active={true}
                onScan={handleScannerResult}
                onError={(error) => addToast(error, "error")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-slate-900">POS Terminal</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan items or select payment method
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Scanner Button */}
          <button
            onClick={() => setIsScannerOpen(true)}
            className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors lg:hidden"
            aria-label="Open barcode scanner"
          >
            <Camera className="w-5 h-5" />
          </button>
          {/* Mobile cart indicator */}
          {isMobile && items.length > 0 && (
            <motion.span
              layout
              className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{getItemCount()}</span>
            </motion.span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {isMobile ? (
          // Mobile Layout: Search at top, results dropdown, cart at bottom (via CartSheet)
          <div className="space-y-4 pb-32">
            {/* Product Search */}
            <div className="sticky top-16 z-10 bg-white/95 backdrop-blur-sm pb-4 border-b border-slate-100">
              <ProductSearch onProductSelect={handleProductSelect} />
            </div>

            {/* Quick Add Product Grid (for mobile) */}
            <ProductGrid onProductSelect={handleProductSelect} />

            {/* Payment Methods */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                Payment Method
              </p>
              <PaymentMethodSelector
                selected={selectedPaymentMethod}
                onSelect={setPaymentMethod}
              />
            </div>

            {/* QR / Barcode Section */}
            <AnimatePresence>
              {isCodeSectionVisible && selectedPaymentMethod && (
                <motion.div
                  {...CODE_SECTION_ANIMATION}
                  className="overflow-hidden"
                >
                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4 text-center">
                      Scan to Pay
                    </p>
                    <div className="flex flex-col items-center gap-5">
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <QRDisplay value={qrPayload} size={QR_CODE_SIZE_PX} />
                      </div>
                      <div className="w-full flex items-center gap-3">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                          or scan barcode
                        </span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl w-full flex justify-center">
                        <BarcodeDisplay data={barcodePayload} type="code128" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pb-4">
              <button
                onClick={handleToggleCodeSection}
                disabled={!selectedPaymentMethod}
                className="w-full h-[52px] rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  {isCodeSectionVisible ? "visibility_off" : "qr_code_2"}
                </span>
                {isCodeSectionVisible ? "Hide QR / Barcodes" : "Show QR / Barcodes"}
              </button>

              <button
                onClick={handleOpenPaymentModal}
                disabled={isPayButtonDisabled}
                className="w-full h-[52px] bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isPaymentProcessing && (
                  <span className="material-symbols-outlined text-lg animate-spin">
                    progress_activity
                  </span>
                )}
                <span className="material-symbols-outlined text-lg">
                  shopping_cart_checkout
                </span>
                Charge Rs. {getSubtotal().toFixed(2)} →
              </button>
            </div>
          </div>
        ) : (
          // Desktop Layout: Left 60% = search + product grid, Right 40% = cart panel
          <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 h-full">
            {/* Left Panel: Search + Product Grid */}
            <div className="flex flex-col h-full space-y-4">
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <ProductSearch onProductSelect={handleProductSelect} className="flex-1" />
                  <button
                    onClick={() => setIsScannerOpen(true)}
                    className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                    aria-label="Open barcode scanner"
                  >
                    <Camera className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <ProductGrid onProductSelect={handleProductSelect} />
            </div>

            {/* Right Panel: Cart + Payment (always visible) */}
            <div className="flex flex-col h-full space-y-4">
              {/* Cart Section */}
              <div className="flex-1 min-h-0">
                <CartPanel onPay={handleOpenPaymentModal} />
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm sticky top-64">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-3">
                  Payment Method
                </p>
                <PaymentMethodSelector
                  selected={selectedPaymentMethod}
                  onSelect={setPaymentMethod}
                />
              </div>

              {/* QR / Barcode Section */}
              <AnimatePresence>
                {isCodeSectionVisible && selectedPaymentMethod && (
                  <motion.div
                    {...CODE_SECTION_ANIMATION}
                    className="overflow-hidden"
                  >
                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm sticky top-64">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono mb-4 text-center">
                        Scan to Pay
                      </p>
                      <div className="flex flex-col items-center gap-5">
                        <div className="p-3 bg-white rounded-xl border border-slate-100">
                          <QRDisplay value={qrPayload} size={QR_CODE_SIZE_PX} />
                        </div>
                        <div className="w-full flex items-center gap-3">
                          <div className="flex-1 h-px bg-slate-200" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                            or scan barcode
                          </span>
                          <div className="flex-1 h-px bg-slate-200" />
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl w-full flex justify-center">
                          <BarcodeDisplay data={barcodePayload} type="code128" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 sticky bottom-0 bg-white/95 backdrop-blur-sm pt-4 border-t border-slate-100">
                <button
                  onClick={handleToggleCodeSection}
                  disabled={!selectedPaymentMethod}
                  className="w-full h-[52px] rounded-xl border border-primary text-primary font-semibold text-sm hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    {isCodeSectionVisible ? "visibility_off" : "qr_code_2"}
                  </span>
                  {isCodeSectionVisible ? "Hide QR / Barcodes" : "Show QR / Barcodes"}
                </button>

                <button
                  onClick={handleOpenPaymentModal}
                  disabled={isPayButtonDisabled}
                  className="w-full h-[52px] bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isPaymentProcessing && (
                    <span className="material-symbols-outlined text-lg animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span className="material-symbols-outlined text-lg">
                    shopping_cart_checkout
                  </span>
                  Charge Rs. {getSubtotal().toFixed(2)} →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={items}
        cashierName={cashierName}
        getSubtotal={getSubtotal}
        selectedPaymentMethod={selectedPaymentMethod}
      />
    </div>
  );
}

// Simple product grid for quick adding on mobile/desktop
function ProductGrid({ onProductSelect }: { onProductSelect: (product: Product) => void }) {
  const { data: products = [] } = useProducts();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {products.slice(0, 12).map((product) => (
        <button
          key={product.id}
          onClick={() => onProductSelect(product)}
          disabled={product.stock <= 0}
          className={`
            p-3 border rounded-lg text-left transition-all cursor-pointer
            ${product.stock <= 0
              ? "bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed"
              : "bg-white border-slate-200 hover:border-primary hover:shadow-md"
            }
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">{product.name}</h3>
              <p className="text-xs text-slate-500 truncate mt-0.5">Rs. {product.price.toFixed(2)}</p>
            </div>
            <Plus className="w-5 h-5 text-primary flex-shrink-0" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${product.stock <= 0 ? "bg-red-100 text-red-700" : product.stock <= (product.low_stock_threshold ?? 10) ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}
            >
              {product.stock <= 0 ? "Out" : product.stock <= (product.low_stock_threshold ?? 10) ? "Low" : "In Stock"}
            </span>
          </div>
        </button>
      ))}
      {products.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          <Search className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p>No products available</p>
        </div>
      )}
    </div>
  );
}