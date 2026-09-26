import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildEsewaPayload } from "@/lib/payments/esewa";
import type { Transaction } from "@/types/transaction";

export const dynamic = "force-dynamic";

export default async function EsewaPaymentPage({ params }: { params: Promise<{ transactionId: string }> }) {
  const { transactionId } = await params;

  const { data: tx, error } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .eq("id", transactionId)
    .eq("payment_status", "pending")
    .single();

  if (error || !tx) {
    notFound();
  }

  const transaction = tx as Transaction;
  const payload = buildEsewaPayload(Number(transaction.total_amount), transaction.transaction_number);

  const hiddenInputs = Object.entries(payload)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
    .join("");

  return (
    <>
      <title>Redirecting to eSewa…</title>
      <form
        id="esewa-form"
        method="POST"
        action={process.env.NEXT_PUBLIC_ESEWA_GATEWAY_URL || "https://esewa.com.np/epay/main"}
      >
        {hiddenInputs}
      </form>
      <script dangerouslySetInnerHTML={{ __html: "document.getElementById('esewa-form').submit()" }} />
    </>
  );
}
