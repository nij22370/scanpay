import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single();

    if (transactionError || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("transaction_items")
      .select("*")
      .eq("transaction_id", id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({ ...transaction, items: items || [] });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transaction" }, { status: 500 });
  }
}