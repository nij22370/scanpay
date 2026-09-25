"use client";

import { useMemo } from "react";
import { NepaliDate } from "@/lib/nepali-date";
import { formatCurrency } from "@/lib/vat";
import { BarcodeDisplay } from "@/components/codes/BarcodeDisplay";
import { QRDisplay } from "@/components/codes/QRDisplay";
import { cn } from "@/lib/utils";
import type { TransactionWithItems } from "@/types/transaction";

interface SlipTemplateProps {
  transaction: TransactionWithItems;
  className?: string;
}

export function SlipTemplate({ transaction, className }: SlipTemplateProps) {
  const formattedBsDate = useMemo(() => {
    return NepaliDate.fromAD(transaction.created_at).format("YYYY-MM-DD");
  }, [transaction.created_at]);

  const subtotal = transaction.amount;
  const vat = transaction.tax_amount;
  const discount = transaction.discount_amount;
  const total = transaction.total_amount;
  const discountedSubtotal = subtotal - discount;

  return (
    <div className={cn("max-w-[380px] mx-auto font-mono text-slate-800 bg-white", className)}>
      <div className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-extrabold text-sm mb-1">
            <span className="material-symbols-outlined text-base">check_circle</span>
            PAYMENT SUCCESSFUL
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">ScanPay Store</h1>
          <p className="text-xs sm:text-sm text-slate-500">New Road, Kathmandu, Nepal</p>
          <p className="text-[10px] sm:text-[11px] text-slate-400">PAN/VAT: 609823145</p>
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction No:</span>
            <span className="font-bold text-slate-900">{transaction.transaction_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date (BS):</span>
            <span className="font-semibold text-slate-800">{formattedBsDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment:</span>
            <span className="font-bold text-slate-900 capitalize px-2 py-0.5 rounded bg-slate-100 text-[10px] sm:text-[11px]">
              {transaction.payment_provider || transaction.payment_method}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Cashier:</span>
            <span className="font-medium text-slate-800 text-right max-w-[60%] truncate">{transaction.created_by.slice(0, 8)}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-dashed border-slate-300 pt-3">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="text-slate-400 uppercase text-[9px] sm:text-[10px] border-b border-slate-200">
                <th className="pb-1 font-semibold w-[65%]">Item</th>
                <th className="pb-1 font-semibold text-center w-[10%]">Qty</th>
                <th className="pb-1 font-semibold text-right w-[25%]">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transaction.items.map((item, idx) => (
                <tr key={idx} className="text-slate-700">
                  <td className="py-1.5 font-medium pr-2 leading-tight">{item.product_name}</td>
                  <td className="py-1.5 text-center text-slate-500">x{item.quantity}</td>
                  <td className="py-1.5 text-right font-semibold">{formatCurrency(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Amounts Breakdown */}
        <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs sm:text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Discount:</span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-500">
            <span>Taxable:</span>
            <span>{formatCurrency(discountedSubtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>VAT (13%):</span>
            <span>{formatCurrency(vat)}</span>
          </div>
          <div className="flex justify-between text-base sm:text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>GRAND TOTAL:</span>
            <span className="text-emerald-700">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Details for Cash */}
        {transaction.payment_method === "cash" && (
          <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs sm:text-sm">
            <div className="flex justify-between text-slate-500">
              <span>Cash Tendered:</span>
              <span>{formatCurrency((transaction as any).cash_tendered || total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Change:</span>
              <span>{formatCurrency((transaction as any).cash_change || 0)}</span>
            </div>
          </div>
        )}

        {/* Barcode & QR */}
        <div className="border-t border-dashed border-slate-300 pt-4 flex flex-col items-center gap-3">
          <BarcodeDisplay data={transaction.transaction_number} type="code128" />
          <div className="p-2 bg-slate-50 rounded-xl">
            <QRDisplay value={`scanpay://verify/${transaction.transaction_number}`} size={120} />
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 text-center font-mono">
            Scan QR to verify receipt authenticity
          </p>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-dashed border-slate-300 pt-3">
          <p className="text-xs sm:text-sm font-semibold text-slate-600">Dhanyabad! Thank you for your visit.</p>
          <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Powered by ScanPay Nepal</p>
        </div>
      </div>
    </div>
  );
}