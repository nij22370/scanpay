import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { z } from "zod";

const transactionSchema = z.object({
  transaction_number: z.string().min(1, "Transaction number is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  tax_amount: z.coerce.number().nonnegative().default(0),
  discount_amount: z.coerce.number().nonnegative().default(0),
  total_amount: z.coerce.number().positive("Total must be positive"),
  payment_method: z.string().min(1, "Payment method is required"),
  payment_provider: z.string().optional(),
  payment_status: z.string().default("pending"),
  status: z.string().default("completed"),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  notes: z.string().optional(),
  slip_url: z.string().url().optional(),
  created_by: z.string().default("system"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = transactionSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from("transactions")
      .insert(parsed)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors.map((e) => e.message).join(", ") }, { status: 400 });
    }
    return NextResponse.json({ error: String(error) }, { status: 500 });
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