import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyEsewaResponse } from "@/lib/payments/esewa";
import type { EsewaVerifyResponse } from "@/lib/payments/esewa";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data");

  let decoded: EsewaVerifyResponse | null = null;

  if (data) {
    decoded = verifyEsewaResponse(data);
  }

  if (!decoded) {
    const totalAmount = searchParams.get("total_amount");
    const txnUuid = searchParams.get("transaction_uuid");
    const status = searchParams.get("status");
    const txnCode = searchParams.get("transaction_code");

    if (totalAmount && txnUuid && status && txnCode) {
      decoded = {
        transaction_uuid: txnUuid,
        total_amount: totalAmount,
        status,
        transaction_code: txnCode,
        product_code: "EPAYTEST",
        signature: "",
        signed_field_names: "total_amount,transaction_uuid,product_code",
      } as EsewaVerifyResponse;
    }
  }

  if (!decoded || decoded.status !== "COMPLETE") {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-failed`);
  }

  const { error: updateError } = await supabaseAdmin
    .from("transactions")
    .update({
      payment_status: "completed",
      status: "completed",
      slip_url: decoded.transaction_code,
    })
    .eq("transaction_number", decoded.transaction_uuid)
    .select()
    .single();

  if (updateError) {
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

export async function POST(req: NextRequest) {
  const body = await req.text();
  const searchParams = new URLSearchParams(body);
  const data = searchParams.get("data");

  if (!data) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-failed`);
  }

  const decoded = verifyEsewaResponse(data);

  if (!decoded || decoded.status !== "COMPLETE") {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/payment-failed`);
  }

  const { error: updateError } = await supabaseAdmin
    .from("transactions")
    .update({
      payment_status: "completed",
      status: "completed",
      slip_url: decoded.transaction_code,
    })
    .eq("transaction_number", decoded.transaction_uuid)
    .select()
    .single();

  if (updateError) {
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
