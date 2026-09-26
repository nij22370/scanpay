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

const pendingTransactionSchema = z.object({
  items: z.array(transactionItemSchema).min(1, "At least one item required"),
  subtotal: z.number().positive(),
  discount: z.number().nonnegative().default(0),
  vat: z.number().nonnegative().default(0),
  total: z.number().positive(),
  payment_mode: z.enum(["esewa", "khalti", "fonepay"]),
  cashier_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = pendingTransactionSchema.parse(body);

    const { items, subtotal, discount, vat, total, payment_mode, cashier_id } = parsed;

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
        payment_provider: payment_mode,
        payment_status: "pending",
        status: "pending",
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

    const transactionItems = items.map((item) => ({
      transaction_id: transaction.id,
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
      await supabaseAdmin.from("transactions").delete().eq("id", transaction.id);
      return NextResponse.json({ error: itemsError.message }, { status: 400 });
    }

    return NextResponse.json({ transactionId: transaction.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 });
    }
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}