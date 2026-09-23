"use client";

import { POSScreen } from "@/components/pos/POSScreen";
import { ToastProvider } from "@/hooks/useToast";

export default function POSPage() {
  return (
    <ToastProvider>
      <POSScreen />
    </ToastProvider>
  );
}