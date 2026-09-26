import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { buildEsewaPayload, buildEsewaUrl } from "@/lib/payments/esewa";
import { environment } from "@/lib/payments/env";
import type { Transaction } from "@/types/transaction";

const initiateSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  transactionId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = initiateSchema.parse(body);

    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", parsed.transactionId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const tx = transaction as Transaction;
    const payload = buildEsewaPayload(Number(tx.total_amount), tx.transaction_number);
    const gatewayUrl = buildEsewaUrl(payload);

    return NextResponse.json({ payload, gatewayUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to initiate eSewa payment" }, { status: 500 });
  }
}
