"use client";

import { useSlip } from "@/hooks/useSlip";
import { BarcodeDisplay } from "@/components/codes/BarcodeDisplay";
import { QRDisplay } from "@/components/codes/QRDisplay";
import { NepaliDate } from "@/lib/nepali-date";

interface SlipDisplayProps {
  transactionId: string;
}

export function SlipDisplay({ transactionId }: SlipDisplayProps) {
  const { data: slipData, isLoading, error } = useSlip(transactionId);

  if (isLoading) return <div>Loading slip...</div>;
  if (error) return <div>Error loading slip: {error.message}</div>;
  if (!slipData) return null;

  const bsDate = NepaliDate.fromAD(slipData.created_at).format("YYYY-MM-DD");

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg bg-white shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">ScanPay</h1>
      <hr className="mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Transaction #</span>
          <span className="font-mono">{slipData.transaction_number}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Date (BS)</span>
          <span>{bsDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-bold">Rs. {slipData.total_amount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Payment</span>
          <span>{slipData.payment_provider ?? slipData.payment_method}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Status</span>
          <span className="capitalize">{slipData.payment_status}</span>
        </div>
        {slipData.customer_name && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Customer</span>
            <span>{slipData.customer_name}</span>
          </div>
        )}
      </div>
      <hr className="my-4" />
      <div className="flex flex-col items-center gap-4">
        <BarcodeDisplay data={slipData.transaction_number} type="code128" />
        <QRDisplay value={`scanpay://verify/${slipData.transaction_number}`} size={150} />
      </div>
      <p className="text-center text-xs text-muted-foreground mt-4">
        Thank you for your payment!
      </p>
    </div>
  );
}