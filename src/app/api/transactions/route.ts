import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const transactionItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_price: z.number().nonnegative(),
  total_price: z.number().nonnegative(),
});

const cashTransactionSchema = z.object({
  items: z.array(transactionItemSchema).min(1, "At least one item required"),
  subtotal: z.number().positive(),
  discount: z.number().nonnegative().default(0),
  vat: z.number().nonnegative().default(0),
  total: z.number().positive(),
  payment_mode: z.literal("cash"),
  cash_tendered: z.number().positive(),
  cash_change: z.number().nonnegative(),
  cashier_id: z.string().uuid(),
  split_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = cashTransactionSchema.parse(body);

    const { items, subtotal, discount, vat, total, payment_mode, cash_tendered, cash_change, cashier_id, split_id } = parsed;

    const transaction_number = `TXN-${Date.now().toString(36).toUpperCase()}`;

    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("transactions")
      .insert({
        transaction_number,
        amount: subtotal,
        tax_amount: vat,
        discount_amount: discount,
        total_amount: total,
        payment_method: payment_mode,
        payment_provider: "cash",
        payment_status: "completed",
        status: "completed",
        customer_name: null,
        customer_phone: null,
        notes: null,
        slip_url: null,
        created_by: cashier_id,
      })
      .select()
      .single();

    if (transactionError) {
      return NextResponse.json({ error: transactionError.message }, { status: 400 });
    }

    const transactionId = transaction.id;

    const transactionItems = items.map((item) => ({
      transaction_id: transactionId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("transaction_items")
      .insert(transactionItems);

    if (itemsError) {
      await supabaseAdmin.from("transactions").delete().eq("id", transactionId);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    const stockUpdates = items.map((item) =>
      supabaseAdmin
        .from("products")
        .update({ stock: item.product_id })
        .eq("id", item.product_id)
        .select("stock")
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          const currentStock = data.stock;
          const newStock = Math.max(0, currentStock - item.quantity);
          return supabaseAdmin
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.product_id);
        })
    );

    await Promise.all(stockUpdates);

    return NextResponse.json({ transactionId }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const provider = searchParams.get("payment_provider");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    let query = supabaseAdmin.from("transactions").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    if (provider) query = query.eq("payment_provider", provider);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}