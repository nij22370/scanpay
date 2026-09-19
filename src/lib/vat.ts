export const VAT_RATE = 0.13;

export function calculateVAT(amount: number): number {
  return Math.round(amount * VAT_RATE * 100) / 100;
}

export function calculateTotal(
  subtotal: number,
  discount: number,
  vatApplicable: boolean
): { vat: number; total: number } {
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = vatApplicable ? calculateVAT(discountedSubtotal) : 0;
  const total = Math.round((discountedSubtotal + vat) * 100) / 100;

  return { vat, total };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
}
