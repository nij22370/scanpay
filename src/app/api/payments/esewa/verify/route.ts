import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyEsewaResponse } from "@/lib/payments/esewa";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");

  if (!data) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-failed`);
  }

  const decoded = verifyEsewaResponse(data);

  if (!decoded || decoded.status !== "COMPLETE") {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-failed`);
  }

  const { error } = await supabaseAdmin
    .from("transactions")
    .update({
      payment_status: "completed",
      status: "completed",
      slip_url: decoded.txn_id,
    })
    .eq("transaction_number", decoded.transaction_uuid)
    .select()
    .single();

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-failed`);
  }

  const { data: tx } = await supabaseAdmin
    .from("transactions")
    .select("id")
    .eq("transaction_number", decoded.transaction_uuid)
    .single();

  const redirectUrl = tx?.id
    ? `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/slip/${tx.id}`
    : `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-failed`;

  return NextResponse.redirect(redirectUrl);
}
