"use client";

import { useMemo } from "react";
import { useCartStore } from "@/store";
import { calculateTotal, VAT_RATE, formatCurrency } from "@/lib/vat";

export interface CartTotals {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
  vatApplicable: boolean;
  formatted: {
    subtotal: string;
    discount: string;
    vat: string;
    total: string;
  };
}

export function useCartTotals(discount: number = 0): CartTotals {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal]);

  const vatApplicable = useMemo(
    () => items.some((item) => item.product.vat_applicable),
    [items]
  );

  const { vat, total } = useMemo(
    () => calculateTotal(subtotal, discount, vatApplicable),
    [subtotal, discount, vatApplicable]
  );

  return useMemo(
    () => ({
      subtotal,
      discount,
      vat,
      total,
      vatApplicable,
      formatted: {
        subtotal: formatCurrency(subtotal),
        discount: formatCurrency(discount),
        vat: formatCurrency(vat),
        total: formatCurrency(total),
      },
    }),
    [subtotal, discount, vat, total, vatApplicable]
  );
}