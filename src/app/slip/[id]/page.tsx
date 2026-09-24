"use client";

import { useParams } from "next/navigation";
import { SlipDisplay } from "@/components/slip/SlipDisplay";

export default function SlipPage() {
  const params = useParams();
  const transactionId = (params?.id as string) || "mock-transaction-id";

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <SlipDisplay transactionId={transactionId} />
    </div>
  );
}
