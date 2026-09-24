"use client";

import { useCallback, useMemo } from "react";
import { useSlip } from "@/hooks/useSlip";
import { BarcodeDisplay } from "@/components/codes/BarcodeDisplay";
import { QRDisplay } from "@/components/codes/QRDisplay";
import { NepaliDate } from "@/lib/nepali-date";
import { formatCurrency, VAT_RATE } from "@/lib/vat";
import { Printer, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import jsPDF from "jspdf";

interface SlipDisplayProps {
  transactionId: string;
}

export function SlipDisplay({ transactionId }: SlipDisplayProps) {
  const { data: realSlipData, isLoading } = useSlip(transactionId);

  // Fallback mock slip data for testing/demo if DB record is absent
  const slipData = useMemo(() => {
    return realSlipData || {
      id: transactionId || "TXN-89421",
      transaction_number: `TXN-${(transactionId || "89421").slice(-6).toUpperCase()}`,
      amount: 1283.19,
      tax_amount: 166.81,
      discount_amount: 0,
      total_amount: 1450.0,
      payment_method: "esewa",
      payment_provider: "eSewa Direct",
      payment_status: "completed",
      status: "completed",
      customer_name: "Ram Shrestha",
      customer_phone: null,
      notes: null,
      slip_url: null,
      created_by: "00000000-0000-0000-0000-000000000000",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        { name: "Wai Wai Noodles (75g)", quantity: 5, unit_price: 30 },
        { name: "Dairy Milk Silk 150g", quantity: 2, unit_price: 350 },
        { name: "Amul Butter 500g", quantity: 1, unit_price: 600 },
      ],
    };
  }, [realSlipData, transactionId]);

  const formattedBsDate = useMemo(() => {
    return NepaliDate.fromAD(slipData.created_at).format("YYYY-MM-DD");
  }, [slipData.created_at]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(() => {
    const doc = new jsPDF({
      unit: "mm",
      format: [80, 180],
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ScanPay Nepal", 40, 10, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Kathmandu, Nepal", 40, 15, { align: "center" });
    doc.text("VAT No: 609823145", 40, 19, { align: "center" });
    doc.text("-----------------------------------------", 40, 23, { align: "center" });

    doc.text(`Receipt #: ${slipData.transaction_number}`, 5, 28);
    doc.text(`Date (BS): ${formattedBsDate}`, 5, 33);
    doc.text(`Payment: ${slipData.payment_provider || slipData.payment_method}`, 5, 38);
    doc.text(`Status: ${slipData.payment_status.toUpperCase()}`, 5, 43);
    doc.text("-----------------------------------------", 40, 47, { align: "center" });

    let y = 52;
    doc.setFont("helvetica", "bold");
    doc.text("Items Purchased", 5, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    if ("items" in slipData && Array.isArray(slipData.items)) {
      slipData.items.forEach((item: { name: string; quantity: number; unit_price: number }) => {
        doc.text(`${item.name} x${item.quantity}`, 5, y);
        doc.text(`Rs. ${(item.quantity * item.unit_price).toFixed(2)}`, 75, y, { align: "right" });
        y += 5;
      });
    }

    doc.text("-----------------------------------------", 40, y, { align: "center" });
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Total Paid:", 5, y);
    doc.text(`Rs. ${slipData.total_amount.toFixed(2)}`, 75, y, { align: "right" });

    y += 8;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for shopping with us!", 40, y, { align: "center" });

    doc.save(`receipt-${slipData.transaction_number}.pdf`);
  }, [slipData, formattedBsDate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-slate-500">Generating transaction receipt...</p>
      </div>
    );
  }

  const subtotal = slipData.amount || slipData.total_amount / (1 + VAT_RATE);
  const taxAmount = slipData.tax_amount || slipData.total_amount - subtotal;

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex items-center justify-between print:hidden max-w-md mx-auto">
        <Link
          href="/pos"
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to POS
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" /> Print Receipt
          </button>
        </div>
      </div>

      {/* Printable Receipt Card */}
      <div className="max-w-md mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-5 text-slate-800 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-extrabold text-sm mb-1">
            <CheckCircle2 className="w-4 h-4" /> PAYMENT SUCCESSFUL
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">ScanPay Store</h1>
          <p className="text-xs text-slate-500">New Road, Kathmandu, Nepal</p>
          <p className="text-[11px] text-slate-400 font-mono">PAN/VAT: 609823145</p>
        </div>

        {/* Transaction Details */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Transaction No:</span>
            <span className="font-mono font-bold text-slate-900">{slipData.transaction_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Date (BS):</span>
            <span className="font-semibold text-slate-800">{formattedBsDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Gateway:</span>
            <span className="font-bold text-slate-900 capitalize px-2 py-0.5 rounded bg-slate-100 text-[11px]">
              {slipData.payment_provider || slipData.payment_method}
            </span>
          </div>
          {slipData.customer_name && (
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-medium text-slate-800">{slipData.customer_name}</span>
            </div>
          )}
        </div>

        {/* Itemized Table */}
        {"items" in slipData && Array.isArray(slipData.items) && (
          <div className="pt-2 border-t border-dashed border-slate-300">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200">
                  <th className="pb-1 font-semibold">Item</th>
                  <th className="pb-1 font-semibold text-center">Qty</th>
                  <th className="pb-1 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slipData.items.map((item: { name: string; quantity: number; unit_price: number }, idx: number) => (
                  <tr key={idx} className="text-slate-700">
                    <td className="py-1.5 font-medium pr-2">{item.name}</td>
                    <td className="py-1.5 text-center text-slate-500">x{item.quantity}</td>
                    <td className="py-1.5 text-right font-semibold">
                      {formatCurrency(item.quantity * item.unit_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Amounts Breakdown */}
        <div className="pt-3 border-t border-dashed border-slate-300 space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-500">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>VAT (13%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
            <span>Grand Total:</span>
            <span className="text-emerald-700">{formatCurrency(slipData.total_amount)}</span>
          </div>
        </div>

        {/* Barcode & Verification QR */}
        <div className="pt-4 border-t border-dashed border-slate-300 flex flex-col items-center gap-3">
          <BarcodeDisplay data={slipData.transaction_number} type="code128" />
          <div className="p-2 bg-slate-50 rounded-xl">
            <QRDisplay value={`scanpay://verify/${slipData.transaction_number}`} size={120} />
          </div>
          <p className="text-[10px] text-slate-400 font-mono text-center">
            Scan QR code to verify receipt authenticity
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs font-semibold text-slate-600">Dhanyabad! Thank you for your visit.</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Powered by ScanPay Nepal</p>
        </div>
      </div>
    </div>
  );
}